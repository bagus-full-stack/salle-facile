import { Controller, Get, Patch, Param, Body, ParseUUIDPipe, UseGuards, Req, Delete, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateRoleDto, UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto'; // Import CreateUserDto
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

    @Post()
    @Roles(Role.SUPER_ADMIN)
    async createUser(@Body() dto: CreateUserDto) {
        return this.usersService.createUser(dto);
    }

    @Patch(':id')
    @Roles(Role.SUPER_ADMIN, Role.MANAGER)
    async updateUser(
        @Param('id', ParseUUIDPipe) targetUserId: string,
        @Body() dto: UpdateUserDto,
        @Req() req
    ) {
        const adminId = req.user.sub || req.user.id;
        return this.usersService.updateUser(adminId, targetUserId, dto);
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

    @Delete(':id')
    @Roles(Role.SUPER_ADMIN)
    async deleteUser(@Param('id', ParseUUIDPipe) targetUserId: string, @Req() req) {
        const adminId = req.user.sub || req.user.id;
        return this.usersService.deleteUser(adminId, targetUserId);
    }
}