import { Injectable, Inject } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import type { IUsersRepository } from 'src/users/repository/users.repository.interface';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        @Inject('IUsersRepository')
        private usersRepository: IUsersRepository
    ) { }

    async login(loginDto: LoginDto) {
        const user = await this.usersRepository.findUserWithTenants(loginDto.email);

        if (!user) {
            throw new Error('Invalid Credentials');
        }

        const isPasswordValid = bcrypt.compareSync(loginDto.password, user.password);

        if (!isPasswordValid) {
            throw new Error('Invalid Credentials');
        }

        const token = this.jwtService.sign({ name: user.name, email: user.email, sub: user.id });

        return {
            access_token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                memberships: user.memberships
            }
        };
    }


    async register(registerDto: RegisterDto) {
        const existingUser = await this.usersRepository.findByEmail(registerDto.email);

        if (existingUser) {
            throw new Error('User already exists');
        }

        const hashedPassword = bcrypt.hashSync(registerDto.password, 10);

        const user = await this.usersRepository.createWithTenant({
            user: {
                email: registerDto.email,
                name: registerDto.name,
                lastName: registerDto.lastName,
                password: hashedPassword,
            },
            tenant: {
                name: registerDto.tenantName,
                slug: registerDto.tenantSlug,
            }
        });

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            message: 'User registered successfully'
        };
    }

    async switchTenant(userId: string, tenantId: string) {
        const membership = await this.prisma.member.findUnique({
            where: {
                userId_tenantId: {
                    userId,
                    tenantId
                }
            },
            include: {
                tenant: true,
                user: true
            }
        });

        if (!membership) {
            throw new Error('Access denied to this organization');
        }

        const payload = {
            sub: userId,
            email: membership.user.email,
            name: membership.user.name,
            tenantId: membership.tenant.id,
            role: membership.role
        };

        return {
            access_token: this.jwtService.sign(payload),
            tenant: membership.tenant
        };
    }

    getUserIdFromToken(token: string): string {
        const payload = this.jwtService.verify(token);
        return payload.sub;
    }

    async me(email: string) {
        const user = await this.usersRepository.findUserWithTenants(email);

        if (!user) {
            throw new Error('User not found');
        }

        const { password, ...result } = user;
        return result;
    }
}
