import { TenantRole } from "generated/prisma/enums";

export class UpdateMemberRoleDto {
    role: TenantRole;
    tenantId: string;
}