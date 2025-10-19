import { Transform } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class UpdateFlowerDto {
    @IsOptional()
    @IsString()
    name: string;
  
    @IsOptional()
    @IsString()
    description: string
  
    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    price: number;
  
    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    @Max(5)
    rating: number;
  
    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    stockQuantity: number;
  
    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    discountPercent: number;
  
    @IsOptional()
    @IsString()
    occasion: string;
  
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => {
      if (!value) return [];
      try {
        // handle both "['a','b']" and '["a","b"]'
        return JSON.parse(value.replace(/'/g, '"'));
      } catch {
        return [];
      }
    })
    types: string[];
  
    @IsOptional()
    @IsString()
    form: string;
  
    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    quantitySold: number;
}
