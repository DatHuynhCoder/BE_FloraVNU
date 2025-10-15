import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateAccountDto } from './create-account.dto';
import { IsDateString, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class UpdateAccountDto extends PartialType(OmitType(CreateAccountDto, ['role', 'password'] as const),) {
    @IsOptional()
    @IsString()
    username: string;

    @IsOptional()
    @IsString()
    fullName: string;

    @IsOptional()
    @IsEmail({}, {message: 'Email không hợp lệ'})
    email: string;

    @IsOptional()
    @IsEnum(['Nam', 'Nữ', 'Khác'])
    gender: string;

    @IsOptional()
    @IsDateString()
    birthday: Date;

    @IsOptional()
    @IsString()
    phone: string;
}
