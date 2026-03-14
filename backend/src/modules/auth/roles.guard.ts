import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true; // Si aucun rôle n'est requis, on laisse passer (ou on bloque selon politique par défaut)
        }

        const { user } = context.switchToHttp().getRequest();
        
        // Si pas d'user (non authentifié), le JwtAuthGuard a déjà dû bloquer, mais par sécurité :
        if (!user) return false;

        return requiredRoles.some((role) => user.role === role);
    }
}

