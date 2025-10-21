import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from './schemas/account.schema';
import { CloudinaryModule } from 'src/common/services/cloudinary/cloudinary.module';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports:[
    MongooseModule.forFeature([{name: Account.name, schema: AccountSchema}]),
    CloudinaryModule,
    MailerModule,
  ],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService]
})
export class AccountModule {}
