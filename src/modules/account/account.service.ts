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

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account.name) private AccountModel: Model<Account>,
    private readonly cloudinaryService: CloudinaryService,
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
  async findOneByName(username: string){
    const account = await this.AccountModel.findOne({
      username: username
    })

    return {
      data: account
    }
  }

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

  async remove(id: string) {
    const account = await this.AccountModel.findByIdAndDelete(id).lean<Account | null>();
    if (!account) {
      throw new NotFoundException(`Account with id ${id} not found`);
    }
    if(account.avatar?.public_id) {
      this.cloudinaryService.deleteImage(account.avatar.public_id);
    }
    return { message: `Account with id ${id} has been deleted` };
  }
}
