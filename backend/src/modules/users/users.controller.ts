import { Controller, Get, Patch, Param, Body, ParseUUIDPipe, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateRoleDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

// ⚠️ À protéger impérativement avec @UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @Roles(Role.SUPER_ADMIN, Role.MANAGER, Role.STAFF)
    async getAllUsers() {
        return this.usersService.getAllUsers();
    }

    @Patch(':id/role')
    @Roles(Role.SUPER_ADMIN)
    async updateRole(
        @Param('id', ParseUUIDPipe) targetUserId: string,
        @Body() dto: UpdateRoleDto,
        @Req() req
    ) {
        const adminId = req.user.sub || req.user.id;
        return this.usersService.updateUserRole(adminId, targetUserId, dto.role);
    }

    @Patch(':id/toggle-status')
    @Roles(Role.SUPER_ADMIN, Role.MANAGER)
    async toggleStatus(@Param('id', ParseUUIDPipe) targetUserId: string, @Req() req) {
        const adminId = req.user.sub || req.user.id;
        return this.usersService.toggleUserStatus(adminId, targetUserId);
    }
}