import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import type { Express } from 'express';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

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
    @Req() req?:any,
  ){

    if ((updateAccountDto as any).role) delete (updateAccountDto as any).role;
    if ((updateAccountDto as any).password) delete (updateAccountDto as any).password;
    return this.accountService.updateProfile(id, updateAccountDto, avatar);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/password')
  changePassword(
    @Param('id') id: string,
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req?: any,
  ){
    return this.accountService.changePassword(id, changePasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountService.remove(id);
  }
}
