import { Injectable } from '@nestjs/common';
import { PayOS, CreatePaymentLinkRequest } from '@payos/node';
import { ConfigService } from '@nestjs/config';
import { CreatePaymentDto } from './types/dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PayosRequestPaymentPayload } from './dto/payos-request-payment.payload';
import { generateSignature } from './payos-utils';
import { OrderService } from '../order/order.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly orderService: OrderService
  ) { }

  async createPayment(uid: string, body: CreatePaymentDto): Promise<any> {
    const url = `https://api-merchant.payos.vn/v2/payment-requests`;
    const config = {
      headers: {
        'x-client-id': this.configService.getOrThrow<string>('PAYOS_CLIENT_ID'),
        'x-api-key': this.configService.getOrThrow<string>('PAYOS_API_KEY'),
      },
    };
    const dataForSignature = {
      orderCode: Number(body.orderId),
      amount: body.amount,
      description: body.description,
      cancelUrl: 'https://floravnu.com/orders-history',
      returnUrl: 'https://floravnu.com/orders-history',
    };
    const signature = generateSignature(
      dataForSignature,
      this.configService.getOrThrow<string>('PAYOS_CHECKSUM_KEY'),
    );
    const payload: PayosRequestPaymentPayload = {
      ...dataForSignature,
      signature,
    };
    const response = await firstValueFrom(
      this.httpService.post(url, payload, config),
    );
    return response.data;
  }

  handleWebhook(body: any) {
    // TODO: Parse provider event and update payment
    console.log("Webhook called and receive: ", body)
    const orderId = body.data.description.split(" ")[1]
    this.orderService.updateOrderPaymentStatus(orderId, true)
    return { received: true };
  }

  async getHistory(orderCode: number) {
    const config = {
      headers: {
        'x-client-id': this.configService.getOrThrow<string>('PAYOS_CLIENT_ID'),
        'x-api-key': this.configService.getOrThrow<string>('PAYOS_API_KEY'),
      },
    };
    const response = await firstValueFrom(
      this.httpService.get(`https://api-merchant.payos.vn/v2/payment-requests/${orderCode}/invoices`, config),
    );
    return response.data;
  }
}
