import { IsEmail, IsNotEmpty, IsString, MinLength } from "@nestjs/class-validator";

export class RegisterDto {
    @IsEmail()
    readonly email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    readonly password: string;

    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @IsString()
    @IsNotEmpty()
    readonly lastName: string

    @IsString()
    @IsNotEmpty()
    readonly tenantName: string

    @IsString()
    @IsNotEmpty()
    readonly tenantSlug: string
}