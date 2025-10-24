import { IsEnum } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsEnum(['Pending', 'Processing', 'Delivered', 'Cancelled'], {
    message: 'Invalid order status provided, the status must be one of the following: Pending, Processing, Delivered, Cancelled'
  })
  status: string;
}