import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import mongoose from "mongoose";

export class UpdateOrderDto {
  @IsNotEmpty()
  orderId: mongoose.Types.ObjectId;

  @IsOptional()
  @IsString()
  senderName?: string;

  @IsOptional()
  @IsString()
  senderEmail?: string;

  @IsOptional()
  @IsString()
  senderPhone?: string;

  @IsOptional()
  @IsString()
  recipientName?: string;

  @IsOptional()
  @IsString()
  recipientPhone?: string;

  @IsOptional()
  @IsString()
  recipientAddress?: string;

  ////////////////////////////////////////

  @IsOptional()
  deliveryDate?: Date;

  @IsOptional()
  @IsString()
  deliveryTime?: string;

  ////////////////////////////////////////

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  note?: string;
}