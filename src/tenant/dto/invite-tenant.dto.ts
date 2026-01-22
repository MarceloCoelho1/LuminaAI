import { IsEmail, IsEnum, IsUUID } from "@nestjs/class-validator";
import { TenantRole } from "generated/prisma/enums";

export class InviteDto {
    @IsEmail()
    invitedUserEmail: string;

    @IsUUID()
    tenantId: string;

    @IsEnum(TenantRole)
    role: TenantRole;
}