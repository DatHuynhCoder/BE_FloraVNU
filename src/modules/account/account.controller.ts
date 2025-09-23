import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';

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


  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountService.update(+id, updateAccountDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountService.remove(+id);
  }
}
