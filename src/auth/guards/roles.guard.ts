import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
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

        if (!authUser.role || !authUser.tenantId) {
            throw new ForbiddenException('Tenant context required. Please switch to a tenant to access this resource.');
        }

        const hasRole = authUser.role === TenantRole.ADMIN || authUser.role === TenantRole.OWNER || requiredRoles.includes(authUser.role);

        if (!hasRole) {
            throw new ForbiddenException('You do not have permission to access this resource. Required roles: ' + requiredRoles.join(', '));
        }

        return true;
    }
}