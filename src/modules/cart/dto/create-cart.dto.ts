import { Transform } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import mongoose from "mongoose";

class CartItem {
  @IsNotEmpty()
  flowerId: mongoose.Types.ObjectId;
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  quantity: number;
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  price: number;
}

export class CreateCartDto {
  @IsNotEmpty()
  accountId: mongoose.Types.ObjectId;

  @IsNotEmpty()
  cartItems: CartItem[]

  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  totalPrice: number
}