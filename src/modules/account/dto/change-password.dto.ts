import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ChangePasswordDto {
    @IsNotEmpty()
    currentPassword: string;

    @IsNotEmpty()
    @Length(6, 50)
    newPassword: string;

    @IsNotEmpty()
    @Length(6, 50)
    confirmNewPassword: string;
}
