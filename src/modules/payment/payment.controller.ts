import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  UseGuards,
  Request
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import type { CreatePaymentDto } from './types/dto';
import { PaymentWebhookGuard } from '../../guards/payment-webhook.guard';
import { JwtAuthGuard } from '../auth/passport/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService
  ) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'customer')
  async createPayment(@Request() req, @Body() body: CreatePaymentDto): Promise<any> {
    return this.paymentService.createPayment(req.user._id, body);
  }

  @Post('webhook') // url: /payment/webhook
  @UseGuards(PaymentWebhookGuard)
  handleWebhook(@Body() body: any) {
    return this.paymentService.handleWebhook(body);
  }
}
