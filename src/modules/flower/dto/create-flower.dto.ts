import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateFlowerDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string

  @IsOptional()
  @IsNumber()
  price: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsNumber()
  stockQuantity: number;

  @IsOptional()
  @IsNumber()
  discountPercent: Number;

  @IsNotEmpty()
  @IsString()
  occasion: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({each: true})
  types: string[];

  @IsNotEmpty()
  @IsString()
  form: string;

  @IsOptional()
  @IsNumber()
  quantitySold: number;
}

