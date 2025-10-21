import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Req, ForbiddenException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import type { Express, Request } from 'express';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';
import { MailerService } from '@nestjs-modules/mailer';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('account')
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly mailerService: MailerService,
  ) {}

  //Register a new account controller
  @Post()
  register(@Body() createAccountDto: CreateAccountDto) {
    return this.accountService.register(createAccountDto);
  }

  @Get()
  findAll() {
    return this.accountService.findAll();
  }
  
  //Find account by username
  @Get('name/:username')
  findOneByName(@Param('username') username: string) {
    return this.accountService.findOneByName(username)
  }
  
  //Find account by Id
  @Get(':id')
  findOneById(@Param('id') id: string) {
    return this.accountService.findOneById(id);
  }

  //Update account profile
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('avatar'))
  updateProfile(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @UploadedFile() avatar?: Express.Multer.File,
    @Req() req?: Request & { user?: { userId?: string; sub?: string; id?: string; _id?: string } },
  ){
    const requesterId = req?.user?.userId ?? req?.user?.sub ?? req?.user?.id ?? req?.user?._id;
    if(requesterId !== id){
      throw new ForbiddenException('You can only update your own profile');
    }
    const { role: _role, password: _pw, ...safeDto } =
      (updateAccountDto as UpdateAccountDto & { role?: unknown; password?: unknown });
    return this.accountService.updateProfile(id, safeDto, avatar);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/password')
  changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req?: Request & { user?: { userId?: string; sub?: string; id?: string; _id?: string } },
  ){
    const requesterId = req?.user?.userId ?? req?.user?.sub ?? req?.user?.id ?? req?.user?._id;
    if(requesterId !== id){
      throw new ForbiddenException('You can only change your own password');
    }
    return this.accountService.changePassword(id, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, 
  @Req() req?: Request & { user?: { userId?: string; sub?: string; id?: string; _id?: string } },) {
    const requesterId = req?.user?.userId ?? req?.user?.sub ?? req?.user?.id ?? req?.user?._id;
    if(requesterId !== id){
      throw new ForbiddenException('You can only delete your own account');
    }
    return this.accountService.deleteAccount(id);
  }
  
  @Post('password/forgot')
  requestPasswordReset(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.accountService.requestPasswordReset(forgotPasswordDto);
  }

  @Post('password/reset')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.accountService.resetPasswordWithOtp(dto);
  }
}
