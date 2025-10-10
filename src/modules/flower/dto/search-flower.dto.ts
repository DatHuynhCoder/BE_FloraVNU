import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class SearchFlowerDto {
  @IsOptional()
  @IsString()
  keyword: string

  @IsOptional()
  @IsString()
  searchType: string

  @IsOptional()
  @Transform(({ value }) => value?.split(','))
  @IsString({each: true})
  sort: string[]

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  priceMin: number

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  priceMax: number

  @IsOptional()
  @Transform(({ value }) => value?.split(','))
  @IsString({each: true})
  occasions: string[]

  @IsOptional()
  @Transform(({ value }) => value?.split(','))
  @IsString({each: true})
  types: string[]

  @IsOptional()
  @Transform(({ value }) => value?.split(','))
  @IsString({each: true})
  forms: string[]

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  page: number

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  limit: number
}