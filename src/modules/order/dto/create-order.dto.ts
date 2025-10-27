import { Transform } from "class-transformer";
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import mongoose from "mongoose";

class OrderItem {
  @IsNotEmpty()
  flowerId: mongoose.Types.ObjectId;
  quantity: number;
}

export class CreateOrderDto {
  // @IsNotEmpty()
  // accountId: mongoose.Types.ObjectId;

  @IsNotEmpty()
  @IsArray()
  orderItems: OrderItem[];

  @IsNotEmpty()
  @IsNumber()
  totalPrice: number;

  @IsOptional()
  @IsString()
  senderName: string;

  @IsOptional()
  @IsString()
  senderEmail: string;

  @IsOptional()
  @IsString()
  senderPhone: string;

  @IsNotEmpty()
  @IsString()
  recipientName: string;

  @IsOptional()
  @IsString()
  recipientPhone: string;

  @IsNotEmpty()
  @IsString()
  recipientAddress: string;

  @IsNotEmpty()
  deliveryDate: Date;

  @IsNotEmpty()
  @IsString()
  deliveryTime: string;

  @IsOptional()
  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  note: string;

  // may be removed because createdAt will be used instead
  // @IsNotEmpty()
  // orderDate: Date;
  @IsOptional()
  @IsString()
  @IsEnum(["Bank", "Cash"], { message: 'paymentMethod must be either Bank or Cash' })
  paymentMethod: string;
}
