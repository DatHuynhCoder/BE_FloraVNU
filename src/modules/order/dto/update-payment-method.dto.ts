import { IsEnum } from 'class-validator';

export class UpdateOrderPaymentMethodDto {
  @IsEnum(['Bank', 'Cash'], {
    message: 'Invalid payment method provided, the payment method must be one of the following: Bank, Cash'
  })
  paymentMethod: string;
}