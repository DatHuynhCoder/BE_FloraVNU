import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from './schemas/account.schema';
import { CloudinaryModule } from '../../common/services/cloudinary/cloudinary.module';

@Module({
  imports:[
    MongooseModule.forFeature([{name: Account.name, schema: AccountSchema}]),
    CloudinaryModule,
  ],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService]
})
export class AccountModule {}
