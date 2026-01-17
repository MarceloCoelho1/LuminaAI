import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { TenantRole } from 'generated/prisma/enums';

@Injectable()
export class RoleGuard implements CanActivate {

    constructor(private reflector: Reflector) { }

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const requiredRoles = this.reflector.get<TenantRole[]>('roles', context.getHandler());
        if (!requiredRoles) {
            return true;
        }
        const authUser = context.switchToHttp().getRequest().user;
        return authUser.role === TenantRole.ADMIN || authUser.role === TenantRole.OWNER || requiredRoles.includes(authUser.role);
    }
}