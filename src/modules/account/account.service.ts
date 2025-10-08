import { ConflictException, Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Account } from './schemas/account.schema';
import { Model } from 'mongoose';
import { hashPass } from 'src/utils/hashPass';

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(Account.name) private AccountModel: Model<Account>
  ) { }

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

  findAll() {
    return `This action returns all account`;
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

  update(id: number, updateAccountDto: UpdateAccountDto) {
    return `This action updates a #${id} account`;
  }

  remove(id: number) {
    return `This action removes a #${id} account`;
  }
}
