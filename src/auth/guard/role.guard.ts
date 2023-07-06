import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './role';
import { PrismaClient } from '@prisma/client';
import { unauthorized } from 'config/Response';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    //
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
            'roles',
            [context.getHandler(), context.getClass()],
        );

        if (!requiredRoles) {
            return true; // Nếu API không được đánh dấu với @RoleDecorator => cho phép truy cập
        }

        // Lấy thông tin từ request
        const req = context.switchToHttp().getRequest();
        const tokenReq = req.headers.authorization.slice(7);
        // console.log(tokenReq);

        const userRoleName = req.user.data.role_name;
        // // Lấy token mới nhất của user khi đăng nhập
        const prisma = new PrismaClient();
        const userSession = await prisma.session.findFirst({
            where: {
                user_id: req.user.data.user_id,
            },
            orderBy: {
                session_id: 'desc',
            },
        });
        const tokenFromDB = userSession.token;

        // So sánh 2 token với nhau ==> user on/off
        if (tokenReq === tokenFromDB) {
            // Nếu từ token user trả về thuộc 1 trong các quyền từ @RoleDecorator(Role.ADMIN, Role.USER, Role.CELEBRITY)
            //  return => true/false
            return requiredRoles.some((role) => role === userRoleName);
        } else {
            return false;
        }
    }
}
