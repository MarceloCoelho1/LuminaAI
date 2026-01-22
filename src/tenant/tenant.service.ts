import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { InviteDto } from './dto/invite-tenant.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import type { ITenantRepository } from './repository/tenant.repository.interface';

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

  async invite(inviteDto: InviteDto, inviterId: string) {
    const { invitedUserEmail, tenantId, role } = inviteDto;

    const userInvited = await this.prisma.user.findUnique({ where: { email: invitedUserEmail } });
    if (!userInvited) {
      throw new Error('User not found');
    }

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    const inviter = await this.prisma.user.findUnique({ where: { id: inviterId } });

    if (!inviter) {
      throw new Error('Inviter not found');
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
}
