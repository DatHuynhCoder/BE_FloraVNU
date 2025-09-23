import { IsDateString, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class CreateAccountDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsEmail({}, {message: 'Email không hợp lệ'})
  email: string;

  @IsOptional()
  @IsEnum(['Nam', 'Nữ', 'Khác'])
  gender?: string;

  @IsNotEmpty()
  @IsDateString()
  birthday: Date;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  @Length(6,50)
  password: string;

  @IsOptional()
  @IsEnum(['admin','customer','seller'])
  role?: string;
}
