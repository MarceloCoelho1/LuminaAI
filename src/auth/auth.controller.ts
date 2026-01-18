import { Body, Controller, Post, UnauthorizedException, UseGuards, Req, Get, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TenantRole } from 'generated/prisma/enums';
import { RequiredRoles } from './required-roles.decorator';
import { RoleGuard } from './guards/roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }


  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('switch-tenant')
  @UseGuards(JwtAuthGuard)
  async switchTenant(@Body() body: { tenantId: string }, @Req() req) {
    const user = req.user;
    try {
      const userId = user.userId;
      return await this.authService.switchTenant(userId, body.tenantId);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  @Get('roles')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @RequiredRoles(TenantRole.MEMBER)
  async testRole(@Req() req) {
    return HttpStatus.OK
  }

}
