import { Injectable } from '@nestjs/common';
import { PayOS, CreatePaymentLinkRequest } from '@payos/node';
import { ConfigService } from '@nestjs/config';
import { CreatePaymentDto } from './types/dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PayosRequestPaymentPayload } from './dto/payos-request-payment.payload';
import { generateSignature } from './payos-utils';

@Injectable()
export class PaymentService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService
  ) { }

  // async createPaymentLink(uid: string, clientId: string, apiKey: string, checksumKey: string) {
  //   // check var
  //   if (clientId === "empty" || apiKey === "empty" || checksumKey === "empty") {
  //     throw new Error("PayOS configuration is missing");
  //   }
  //   // Logic to create a payment link

  //   const payos = new PayOS({
  //     clientId,
  //     apiKey,
  //     checksumKey
  //   })
  //   const YOUR_DOMAIN = 'http://localhost:5000';
  //   const orderInfo: CreatePaymentLinkRequest = {
  //     orderCode: 123,
  //     amount: 10000,
  //     description: "Thanh toan don hang",
  //     items: [
  //       {
  //         name: "name",
  //         quantity: 1,
  //         price: 10000,
  //       },
  //     ],
  //     returnUrl: `${YOUR_DOMAIN}/success?userid=${uid}`,
  //     cancelUrl: `${YOUR_DOMAIN}/cancel`,
  //   };
  //   const paymentLink = await payos.create(orderInfo);

  //   return {
  //     message: 'Creating payment link with PayOS',
  //     data: paymentLink
  //   };
  // }
  async createPayment(body: CreatePaymentDto): Promise<any> {
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
      cancelUrl: 'https://example.com/cancel',
      returnUrl: 'https://example.com/return',
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

  handleWebhook() {
    // TODO: Parse provider event and update payment
    return { received: true };
  }
}
