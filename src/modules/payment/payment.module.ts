import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { HttpModule } from '@nestjs/axios';
import { OrderModule } from '../order/order.module';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService],
  imports: [HttpModule, OrderModule]
})
export class PaymentModule { }
