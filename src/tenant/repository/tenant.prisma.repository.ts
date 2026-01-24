import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ITenantRepository, CreateTenantInput, CreateInviteInput } from './tenant.repository.interface';
import { Tenant, Invite, Member } from 'generated/prisma/client';
import { UpdateMemberRoleDto } from '../dto/update-member-role.dto';

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

    async findInviteById(id: string): Promise<Invite | null> {
        return this.prisma.invite.findUnique({
            where: { id }
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

    async findAllInvites(userId: string): Promise<Invite[]> {
        return this.prisma.invite.findMany({
            where: {
                userId
            }
        });
    }

    async deleteInvite(id: string): Promise<Invite> {
        return this.prisma.invite.delete({ where: { id } });
    }

    async acceptInvite(id: string): Promise<Member> {
        return this.prisma.$transaction(async (tx) => {
            const invite = await tx.invite.findUniqueOrThrow({
                where: { id }
            });

            const member = await tx.member.create({
                data: {
                    userId: invite.userId,
                    tenantId: invite.tenantId,
                    role: invite.role
                }
            });

            await tx.invite.update({
                where: { id },
                data: { status: 'ACCEPTED' }
            });

            return member;
        });
    }

    async declineInvite(id: string): Promise<Invite> {
        return this.prisma.invite.update({
            where: { id },
            data: { status: 'REJECTED' }
        });
    }

    async getTenantMembers(tenantId: string): Promise<Member[]> {
        return await this.prisma.member.findMany({
            where: {
                tenantId
            }, include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        lastName: true,
                        createdAt: true,
                        updatedAt: true
                    }
                }
            }
        });
    }

    async updateMemberRole(memberId: string, updateMemberRole: UpdateMemberRoleDto): Promise<Member> {
        return this.prisma.member.update({
            where: {
                userId_tenantId: {
                    userId: memberId,
                    tenantId: updateMemberRole.tenantId
                }
            },
            data: {
                role: updateMemberRole.role
            }
        });
    }

    async deleteMember(memberId: string, tenantId: string): Promise<Member> {
        return this.prisma.member.delete({
            where: {
                userId_tenantId: {
                    userId: memberId,
                    tenantId
                }
            }
        });
    }
}
