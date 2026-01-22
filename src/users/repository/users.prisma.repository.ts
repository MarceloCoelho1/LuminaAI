import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IUsersRepository, UserWithTenants } from './users.repository.interface';
import { TenantRole, User, Tenant } from 'generated/prisma/client';

@Injectable()
export class UsersPrismaRepository implements IUsersRepository {
    constructor(private prisma: PrismaService) { }

    async findById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id }
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email }
        });
    }

    async findUserWithTenants(email: string): Promise<UserWithTenants | null> {
        return this.prisma.user.findUnique({
            where: { email },
            include: {
                memberships: {
                    include: {
                        tenant: true
                    }
                }
            }
        });
    }

    async findAll(): Promise<User[]> {
        return this.prisma.user.findMany();
    }

    async createWithTenant(data: { user: Partial<User>, tenant: Partial<Tenant> }): Promise<User> {
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: data.user.email!,
                    name: data.user.name!,
                    lastName: data.user.lastName!,
                    password: data.user.password!,
                },
            });

            const tenant = await tx.tenant.create({
                data: {
                    name: data.tenant.name!,
                    slug: data.tenant.slug!,
                }
            });

            await tx.member.create({
                data: {
                    userId: user.id,
                    tenantId: tenant.id,
                    role: TenantRole.OWNER,
                }
            });

            return user;
        });
    }
}
