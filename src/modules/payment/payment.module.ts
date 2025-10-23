import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService],
  imports: [HttpModule]
})
export class PaymentModule { }
