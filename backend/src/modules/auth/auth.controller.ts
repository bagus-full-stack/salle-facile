import {Controller, Post, Body, UseGuards, Get, Req, Res, Patch} from '@nestjs/common';
import * as express from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import {AuthGuard} from "@nestjs/passport";
import { LinkedinAuthGuard } from './linkedin-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('forgot-password')
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.forgotPassword(dto.email);
    }

    @Patch('reset-password')
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto.token, dto.newPassword);
    }

    // ✅ PHASE 2 : Logout endpoint
    @Post('logout')
    @UseGuards(JwtAuthGuard)
    async logout(@Req() req: any) {
        console.log('[auth.controller] POST /logout called for user:', req.user?.sub);
        return { message: 'Déconnexion réussie', success: true };
    }

    // ✅ PHASE 3 : Refresh token endpoint
    @Post('refresh-token')
    @UseGuards(JwtAuthGuard)
    async refreshToken(@Req() req: any) {
        console.log('[auth.controller] POST /refresh-token called for user:', req.user?.sub);
        const userId = req.user?.sub || req.user?.id;
        
        if (!userId) {
            throw new Error('User ID not found in token');
        }
        
        const result = await this.authService.refreshTokenForUser(userId);
        console.log('[auth.controller] Token refreshed successfully for user:', userId);
        return result;
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req) {
        // Cette route redirige l'utilisateur vers la page de login Google
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req, @Res() res: express.Response) {
        // Google nous renvoie ici. req.user contient le JWT généré par notre stratégie.
        const token = req.user.access_token;

        // On redirige vers Angular en passant le token dans l'URL
        res.redirect(`http://localhost:4200/oauth/callback?token=${token}`);
    }

    @Get('linkedin')
    @UseGuards(LinkedinAuthGuard)
    async linkedinAuth(@Req() req) {
        // Cette route redirige l'utilisateur vers la page de login LinkedIn
    }

    @Get('linkedin/callback')
    @UseGuards(LinkedinAuthGuard)
    async linkedinAuthRedirect(@Req() req, @Res() res: express.Response) {
        // LinkedIn nous renvoie ici. req.user contient le JWT généré par notre stratégie.
        const token = req.user.access_token;

        // On redirige vers Angular en passant le token dans l'URL
        res.redirect(`http://localhost:4200/oauth/callback?token=${token}`);
    }
}