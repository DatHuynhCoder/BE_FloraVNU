import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './passport/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ){}

  //login controller
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req){
    return this.authService.login(req.user)
  }

  //check authen
  @UseGuards(JwtAuthGuard)
  @Get('check-authen')
  checkAuthen(){
    return "Xác thực thành công";
  }

  //check author
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('check-author')
  checkAuthor(){
    return "Xin chào Admin!!!"
  }
}
