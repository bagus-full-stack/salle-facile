// backend/src/modules/auth/google.strategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private authService: AuthService) {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID || 'TON_CLIENT_ID',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'TON_SECRET',
            callbackURL: 'http://localhost:3000/auth/google/callback',
            scope: ['email', 'profile'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
        const jwtData = await this.authService.validateOAuthLogin(profile, 'google');
        done(null, jwtData); // Passe le JWT généré au contrôleur
    }
}