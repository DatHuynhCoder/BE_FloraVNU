import { Transform } from "class-transformer";
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCommentDto {
  @IsOptional()
  @IsString()
  content: string

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  rating: number

  @IsNotEmpty()
  @IsMongoId()
  flowerId: string;
}
