import {Controller, Post, Body, UseGuards, Get, Req, Res} from '@nestjs/common';
import * as express from 'express';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import {AuthGuard} from "@nestjs/passport";
import { IsEmail, IsString, MinLength } from 'class-validator';

class ForgotPasswordDto {
    @IsEmail()
    email: string;
}

class ResetPasswordDto {
    @IsString()
    token: string;

    @IsString()
    @MinLength(8)
    password: string;
}

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
    @UseGuards(AuthGuard('linkedin'))
    async linkedinAuth(@Req() req) {
        // Cette route redirige l'utilisateur vers la page de login LinkedIn
    }

    @Get('linkedin/callback')
    @UseGuards(AuthGuard('linkedin'))
    async linkedinAuthRedirect(@Req() req, @Res() res: express.Response) {
        // LinkedIn nous renvoie ici. req.user contient le JWT généré par notre stratégie.
        const token = req.user.access_token;

        // On redirige vers Angular en passant le token dans l'URL
        res.redirect(`http://localhost:4200/oauth/callback?token=${token}`);
    }

    @Post('forgot-password')
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.forgotPassword(dto.email);
    }

    @Post('reset-password')
    async resetPassword(@Body() dto: ResetPasswordDto) {
        return this.authService.resetPassword(dto.token, dto.password);
    }
}