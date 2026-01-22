import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { InviteDto } from './dto/invite-tenant.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RoleGuard } from 'src/auth/guards/roles.guard';
import { RequiredRoles } from 'src/auth/required-roles.decorator';
import { AuthUser } from 'src/auth/interfaces/auth-user.interface';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) { }

  @Post()
  create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantService.create(createTenantDto);
  }

  @UseGuards(JwtAuthGuard, RoleGuard)
  @RequiredRoles('ADMIN')
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
