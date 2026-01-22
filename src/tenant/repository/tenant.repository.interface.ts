import { Tenant, Invite, TenantRole, Member } from "generated/prisma/client";

export type CreateTenantInput = {
    name: string;
    slug: string;
    stripeCustomerId?: string;
    plan?: string;
    credits?: number;
};

export type CreateInviteInput = {
    userId: string;
    tenantId: string;
    role?: TenantRole;
    inviterId?: string;
};

export interface ITenantRepository {
    create(data: CreateTenantInput): Promise<Tenant>;
    invite(data: CreateInviteInput): Promise<Invite>;
    findInvite(userId: string, tenantId: string): Promise<Invite | null>;
    findMember(userId: string, tenantId: string): Promise<Member | null>;
    findAllInvites(userId: string): Promise<Invite[]>;
}
