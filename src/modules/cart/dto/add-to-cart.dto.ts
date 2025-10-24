import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import mongoose from "mongoose";

export class AddToCartDto {
  @IsNotEmpty()
  @IsString()
  flowerId: string;

  @IsNotEmpty()
  @IsNumber()
  flowerPrice: number;
}