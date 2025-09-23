import { Injectable } from '@nestjs/common';
import { AccountService } from '../account/account.service';
import { comparePass } from 'src/utils/hashPass';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private accountService: AccountService,
    private jwtService: JwtService
  ) { }

  async validateUser(username: string, pass: string): Promise<any> {
    const account = (await this.accountService.findOneByName(username)).data;
    if (account && await comparePass(pass, account.password)) {
      const accountObj = account.toObject();
      const { password, ...result } = accountObj;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user._id , role: user.role};
    //get account data too
    const account = (await this.accountService.findOneByName(user.username)).data;
    return {
      data: account,
      accessToken: this.jwtService.sign(payload),
    };
  }
}
