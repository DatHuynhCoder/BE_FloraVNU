import { Transform } from "class-transformer"
import { IsNumber, IsOptional, IsString } from "class-validator"

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  content: string

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  rating: number
}
