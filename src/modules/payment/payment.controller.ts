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
import { ConfigService } from '@nestjs/config';
import type { CreatePaymentDto } from './types/dto';
import { PaymentWebhookGuard } from './guards/payment-webhook.guard.js';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly configService: ConfigService
  ) { }

  // @Get("generate-link")
  // async generatePaymentLink(@Request() req) {
  //   const uid = req.user._id || "anonymous";
  //   const payosClientId = this.configService.get<string>('PAYOS_CLIENT_ID') || "empty";
  //   const payosAPIKey = this.configService.get<string>('PAYOS_API_KEY') || "empty";
  //   const payosChecksumKey = this.configService.get<string>('PAYOS_CHECKSUM_KEY') || "empty";
  //   return this.paymentService.createPaymentLink(uid, payosClientId, payosAPIKey, payosChecksumKey);
  // }

  @Post()
  async createPayment(@Body() body: CreatePaymentDto): Promise<any> {
    return this.paymentService.createPayment(body);
  }

  @Post('webhook') // url: /payment/webhook
  @UseGuards(PaymentWebhookGuard)
  handleWebhook() {
    return this.paymentService.handleWebhook();
  }
}
