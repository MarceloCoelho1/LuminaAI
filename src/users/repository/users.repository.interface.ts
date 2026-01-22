import { User, Tenant, Member } from "generated/prisma/client";

export type UserWithTenants = User & {
    memberships: (Member & {
        tenant: Tenant;
    })[];
};

export interface IUsersRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findUserWithTenants(email: string): Promise<UserWithTenants | null>;
    createWithTenant(data: { user: Partial<User>, tenant: Partial<Tenant> }): Promise<User>;
    findAll(): Promise<User[]>
}
