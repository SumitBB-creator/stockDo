import { IsEmail, IsNotEmpty, MinLength, IsString } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    email!: string;

    @IsNotEmpty()
    @MinLength(6)
    password!: string;

    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsNotEmpty()
    roleId!: string;
}
