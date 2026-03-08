import { Controller, Get, Patch, Param, Body, ParseUUIDPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateRoleDto } from './dto/update-user.dto';

// ⚠️ À protéger impérativement avec @UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    async getAllUsers() {
        return this.usersService.getAllUsers();
    }

    @Patch(':id/role')
    async updateRole(
        @Param('id', ParseUUIDPipe) targetUserId: string,
        @Body() dto: UpdateRoleDto
    ) {
        const mockAdminId = "ID_ADMINISTRATEUR"; // À remplacer par req.user.id
        return this.usersService.updateUserRole(mockAdminId, targetUserId, dto.role);
    }

    @Patch(':id/toggle-status')
    async toggleStatus(@Param('id', ParseUUIDPipe) targetUserId: string) {
        const mockAdminId = "ID_ADMINISTRATEUR"; // À remplacer par req.user.id
        return this.usersService.toggleUserStatus(mockAdminId, targetUserId);
    }
}