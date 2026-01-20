import { TenantRole } from "generated/prisma/enums";

export interface AuthUser {
    userId: string;
    email: string;
    name: string;
    tenantId?: string;
    role?: TenantRole;
}
