import { BadRequestException, ConflictException, NotFoundException, Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/common/services/cloudinary/cloudinary.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Account } from './schemas/account.schema';
import { Model } from 'mongoose';
import { hashPass, comparePass } from 'src/utils/hashPass';
import type {Express} from 'express';
import { MailerService } from '@nestjs-modules/mailer';
import { randomInt } from 'crypto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account.name) private AccountModel: Model<Account>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly mailerService: MailerService,
  ) {}

  //Function to check if email exists
  isEmailExist = async (email: string) => {
    const account = await this.AccountModel.findOne({
      email: email
    })
    if (account) return true;
    return false;
  }

  //Register new account
  async register(createAccountDto: CreateAccountDto) {
    const { username, email, phone } = createAccountDto;

    //Check if email, username or phone exists
    const existdAccount = await this.AccountModel.findOne({
      $or: [{ email }, { username }, { phone }]
    })

    if (existdAccount) {
      throw new ConflictException(`Tài khoản đang được sử dụng`)
    }

    //hashPassword
    const hashedPassword = await hashPass(createAccountDto.password);


    //create Account
    const accountToCreate = {
      ...createAccountDto,
      password: hashedPassword
    }
    const account = await this.AccountModel.create(accountToCreate);

    //extract password from account
    const { password, role, ...result } = account.toJSON();

    return {
      data: result
    };
  }

  async findAll() {
    const items = await this.AccountModel.find().select('-password');
    return {
      data: items
    };
  }

  //find account by id service
  async findOneById(id: string) {
    const account = await this.AccountModel.findById(id);
    return {
      data: account
    };
  }

  //find account by name service
  async findOneByName(username: string) {
    const account = await this.AccountModel.findOne({
      username: username
    })

    return {
      data: account
    }
  }

  //Update account profile 
  async updateProfile(id: string, updateAccountDto: UpdateAccountDto, avatar?: Express.Multer.File) {
    const account = await this.AccountModel.findById(id);
    if (!account) {
      throw new NotFoundException(`Account with id ${id} not found`);
    }

    // Unique checks
    if(updateAccountDto.username){
      const exists = await this.AccountModel.exists({
        _id: { $ne: id },
        username: updateAccountDto.username
      });
      if (exists) {
        throw new ConflictException(`Username ${updateAccountDto.username} is already taken`);
      }
    }
    if (updateAccountDto.email) {
      const exists = await this.AccountModel.exists({
        _id: { $ne: id },
        email: updateAccountDto.email
      });
      if (exists) {
        throw new ConflictException(`Email ${updateAccountDto.email} is already taken`);
      }
    }
    if (updateAccountDto.phone) {
      const exists = await this.AccountModel.exists({
        _id: { $ne: id },
        phone: updateAccountDto.phone
      });
      if (exists) {
        throw new ConflictException(`Phone ${updateAccountDto.phone} is already taken`);
      }
    }

    const updatedData: any = { ...updateAccountDto };

    if ('password' in updatedData) delete updatedData.password;
    if ('role' in updatedData) delete updatedData.role;
    
    if (avatar) {
      if (account.avatar && account.avatar.public_id) {
        // Delete the old avatar from Cloudinary
        await this.cloudinaryService.deleteImage(account.avatar.public_id);
      }
      const uploadResult = await this.cloudinaryService.uploadImage(avatar, 'avatars');
      updatedData.avatar = {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id
      };
    }

    const updated = await this.AccountModel.findByIdAndUpdate(id, updatedData, { 
      new: true, 
      runValidators: true,
    }).select('-password');
    return { 
      data: updated 
    };
  }

  //Change account password
  async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
    if(changePasswordDto.newPassword == changePasswordDto.currentPassword){
      throw new BadRequestException('New password must be different from current password');
    }
    if(changePasswordDto.newPassword !== changePasswordDto.confirmNewPassword) {
      throw new BadRequestException('New password and confirm new password do not match');
    }
    const account = await this.AccountModel.findById(id).select('+password');
    if (!account) {
      throw new NotFoundException(`Account with id ${id} not found`);
    }
    const ok = await comparePass(changePasswordDto.currentPassword, (account as any).password);
    if (!ok) {
      throw new BadRequestException('Current password is incorrect');
    }
    const hashedNewPassword = await hashPass(changePasswordDto.newPassword);
    await this.AccountModel.findByIdAndUpdate(id, { password: hashedNewPassword });
    return { message: 'Password changed successfully' };
  }

  //Delete account
  async deleteAccount(id: string) {
    const account = await this.AccountModel.findByIdAndDelete(id).lean<Account | null>();
    if (!account) {
      throw new NotFoundException(`Account with id ${id} not found`);
    }
    if(account.avatar?.public_id) {
      this.cloudinaryService.deleteImage(account.avatar.public_id);
    }
    return { message: `Account with id ${id} has been deleted` };
  }
  
  //Generate numeric OTP
  private generateNumericOtp(length = 6): string {
    return Array.from({ length }, () => randomInt(0, 10)).join('');
  }

  async requestPasswordReset(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const account = await this.AccountModel.findOne({ email }).select('_id email username');
    // Always return 200 to avoid revealing whether the email exists
    if (!account) {
      return { message: 'If the email exists, we have sent a password reset OTP' };
    }

    const otp = this.generateNumericOtp(6);
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    await this.AccountModel.updateOne(
      { _id: account._id },
      {
        resetPasswordOTP: otp,
        resetPasswordExpires: expires,
        resetPasswordAttempts: 0,
      }
    );

    await this.mailerService.sendMail({
      to: account.email,
      subject: 'FloraVNU - Password Reset OTP',
      template: 'template.hbs',
      context: {
        name: account.username ?? 'you',
        OTP: otp,
      },
    });

    return { message: 'If the email exists, we have sent a password reset OTP' };
  }


  //Reset password with OTP
  async resetPasswordWithOtp(resetPasswordDto: ResetPasswordDto) {
    const { email, otp, newPassword, confirmNewPassword } = resetPasswordDto;
    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException('New password and confirm new password do not match');
    }

    const account = await this.AccountModel.findOne({ email });
    if (!account || !account.resetPasswordOTP || !account.resetPasswordExpires) {
      throw new BadRequestException('OTP is not valid');
    }

    // Check number of attempts
    const attempts = account.resetPasswordAttempts ?? 0;
    if (attempts >= 5) {
      throw new BadRequestException('You have exceeded the number of attempts. Please request a new OTP');
    }

    // Check expiration
    if (account.resetPasswordExpires.getTime() < Date.now()) {
      // Remove OTP when expired
      await this.AccountModel.updateOne(
        { _id: account._id },
        { $unset: { resetPasswordOTP: 1, resetPasswordExpires: 1 }, $set: { resetPasswordAttempts: 0 } }
      );
      throw new BadRequestException('OTP has expired. Please request a new OTP');
    }

    if (account.resetPasswordOTP !== otp) {
      await this.AccountModel.updateOne(
        { _id: account._id },
        { $inc: { resetPasswordAttempts: 1 } }
      );
      throw new BadRequestException('OTP is not valid');
    }

    // All checks passed, update password
    const hashed = await hashPass(newPassword);
    await this.AccountModel.updateOne(
      { _id: account._id },
      {
        $set: { password: hashed },
        $unset: { resetPasswordOTP: 1, resetPasswordExpires: 1 },
        $setOnInsert: { resetPasswordAttempts: 0 }
      }
    );

    return { message: 'Change password successfully' };
  }
}
