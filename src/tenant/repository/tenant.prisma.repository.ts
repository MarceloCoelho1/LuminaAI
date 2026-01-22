import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ITenantRepository, CreateTenantInput, CreateInviteInput } from './tenant.repository.interface';
import { Tenant, Invite, Member } from 'generated/prisma/client';

@Injectable()
export class TenantPrismaRepository implements ITenantRepository {
    constructor(private prisma: PrismaService) { }

    async create(data: CreateTenantInput): Promise<Tenant> {
        return this.prisma.tenant.create({ data });
    }

    async invite(data: CreateInviteInput): Promise<Invite> {
        return this.prisma.invite.create({ data });
    }

    async findInvite(userId: string, tenantId: string): Promise<Invite | null> {
        return this.prisma.invite.findFirst({
            where: {
                userId,
                tenantId
            }
        });
    }

    async findMember(userId: string, tenantId: string): Promise<Member | null> {
        return this.prisma.member.findUnique({
            where: {
                userId_tenantId: {
                    userId,
                    tenantId
                }
            }
        });
    }
}
