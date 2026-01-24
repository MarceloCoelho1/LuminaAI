import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { InviteDto } from './dto/invite-tenant.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/roles.guard';
import { RequiredRoles } from 'src/auth/required-roles.decorator';
import { AuthUser } from 'src/auth/interfaces/auth-user.interface';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) { }

  @Post()
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantService.create(createTenantDto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @RequiredRoles('OWNER', 'ADMIN')
  @Post('/invites')
  invite(@Body() inviteDto: InviteDto, @Req() req) {
    const user = req.user as AuthUser
    return this.tenantService.invite(inviteDto, user.userId);
  }

  @Get('/invites')
  @UseGuards(JwtAuthGuard)
  findAllInvites(@Req() req) {
    const user = req.user as AuthUser
    return this.tenantService.findAllInvites(user.userId);
  }

  @Delete('/invites/:id')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @RequiredRoles('OWNER', 'ADMIN')
  deleteInvite(@Param('id') id: string, @Req() req) {
    const user = req.user as AuthUser;
    return this.tenantService.deleteInvite(id, user.userId);
  }

  @Patch('/members/:memberId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @RequiredRoles('OWNER', 'ADMIN')
  updateMemberRole(@Param('memberId') memberId: string, @Body() updateMemberRoleDto: UpdateMemberRoleDto, @Req() req) {
    const user = req.user as AuthUser;
    return this.tenantService.updateMemberRole(memberId, updateMemberRoleDto, user.userId);
  }

  @Delete('/members/:memberId')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @RequiredRoles('OWNER', 'ADMIN')
  deleteMember(@Param('memberId') memberId: string, @Req() req) {
    const user = req.user as AuthUser;
    if (!user.tenantId) {
      throw new ForbiddenException('Tenant ID not found');
    }
    if (!user.role) {
      throw new ForbiddenException('Role not found');
    }
    return this.tenantService.deleteMember(memberId, user.tenantId, user.userId, user.role);
  }

  @Get('/members')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @RequiredRoles('OWNER', 'ADMIN', 'MEMBER')
  getTenantMembers(@Req() req) {
    const user = req.user as AuthUser;

    if (!user.tenantId) {
      throw new ForbiddenException('Tenant ID not found');
    }
    return this.tenantService.getTenantMembers(user.tenantId);
  }

  @Post('/invites/accept/:id')
  @UseGuards(JwtAuthGuard)
  acceptInvite(@Param('id') id: string, @Req() req) {
    const user = req.user as AuthUser
    return this.tenantService.acceptInvite(id, user.userId);
  }

  @Post('/invites/decline/:id')
  @UseGuards(JwtAuthGuard)
  declineInvite(@Param('id') id: string, @Req() req) {
    const user = req.user as AuthUser
    return this.tenantService.declineInvite(id, user.userId);
  }

  @Get()
  findAll() {
    return this.tenantService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tenantService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTenantDto: UpdateTenantDto) {
    return this.tenantService.update(+id, updateTenantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tenantService.remove(+id);
  }
}
