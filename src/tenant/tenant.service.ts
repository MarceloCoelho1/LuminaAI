import { Inject, Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { InviteDto } from './dto/invite-tenant.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import type { ITenantRepository } from './repository/tenant.repository.interface';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';

@Injectable()
export class TenantService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('ITenantRepository')
    private readonly tenantRepository: ITenantRepository
  ) { }
  create(createTenantDto: CreateTenantDto) {
    return 'This action adds a new tenant';
  }

  findAll() {
    return `This action returns all tenant`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tenant`;
  }

  update(id: number, updateTenantDto: UpdateTenantDto) {
    return `This action updates a #${id} tenant`;
  }

  remove(id: number) {
    return `This action removes a #${id} tenant`;
  }

  async findAllInvites(userId: string) {
    return this.tenantRepository.findAllInvites(userId);
  }

  async getTenantMembers(tenantId: string) {
    return this.tenantRepository.getTenantMembers(tenantId);
  }

  async updateMemberRole(memberId: string, updateMemberRole: UpdateMemberRoleDto, userId: string) {

    const member = await this.tenantRepository.findMember(memberId, updateMemberRole.tenantId);

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (memberId === userId) {
      throw new ForbiddenException('You cannot update your own role');
    }

    if (member.role === 'OWNER') {
      throw new ForbiddenException('You cannot update the role of the owner');
    }

    return this.tenantRepository.updateMemberRole(memberId, updateMemberRole);
  }

  async deleteInvite(id: string, userId: string) {
    const invite = await this.tenantRepository.findInviteById(id);

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    await this.validateInviterMembership(userId, invite.tenantId);

    try {
      return await this.tenantRepository.deleteInvite(id);
    } catch (error) {
      throw error;
    }
  }

  async acceptInvite(id: string, userId: string) {
    const invite = await this.tenantRepository.findInviteById(id);

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.userId !== userId) {
      throw new ForbiddenException('Invite not found');
    }

    if (invite.status !== 'PENDING') {
      throw new ConflictException('Invite is no longer valid');
    }

    const existingMember = await this.tenantRepository.findMember(userId, invite.tenantId);

    if (existingMember) {
      throw new ConflictException('You are already a member of this tenant');
    }

    return await this.tenantRepository.acceptInvite(id);
  }

  async declineInvite(id: string, userId: string) {
    const invite = await this.tenantRepository.findInviteById(id);

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.userId !== userId) {
      throw new ForbiddenException('Invite not found');
    }

    if (invite.status !== 'PENDING') {
      throw new ConflictException('Invite is no longer valid');
    }

    return await this.tenantRepository.declineInvite(id);
  }

  async invite(inviteDto: InviteDto, inviterId: string) {
    const { invitedUserEmail, tenantId, role } = inviteDto;

    await this.validateInviterMembership(inviterId, tenantId);

    const userInvited = await this.prisma.user.findUnique({ where: { email: invitedUserEmail } });
    if (!userInvited) {
      throw new NotFoundException('User not found');
    }

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const inviter = await this.prisma.user.findUnique({ where: { id: inviterId } });

    if (!inviter) {
      throw new NotFoundException('Inviter not found');
    }

    if (userInvited.id === inviter.id) {
      throw new ConflictException('You cannot invite yourself');
    }

    const existingMember = await this.tenantRepository.findMember(userInvited.id, tenantId);

    if (existingMember) {
      throw new ConflictException('User is already a member of this tenant');
    }

    const existingInvite = await this.tenantRepository.findInvite(userInvited.id, tenantId);

    if (existingInvite && existingInvite.status === 'PENDING') {
      throw new ConflictException('User already has a pending invite for this tenant');
    }

    return await this.tenantRepository.invite({
      userId: userInvited.id,
      tenantId,
      inviterId,
      role,
    });
  }

  private async validateInviterMembership(inviterId: string, tenantId: string) {
    const inviterMembership = await this.tenantRepository.findMember(inviterId, tenantId);

    if (!inviterMembership) {
      throw new ForbiddenException('Tenant Not Found');
    }
  }
}
