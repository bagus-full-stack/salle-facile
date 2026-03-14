import { PassportStrategy } from '@nestjs/passport';
// @ts-ignore
import { Strategy } from 'passport-openidconnect';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LinkedinStrategy extends PassportStrategy(Strategy, 'linkedin') {
    constructor(private authService: AuthService) {
        super({
            issuer: 'https://www.linkedin.com',
            authorizationURL: 'https://www.linkedin.com/oauth/v2/authorization',
            tokenURL: 'https://www.linkedin.com/oauth/v2/accessToken',
            userInfoURL: 'https://api.linkedin.com/v2/userinfo',
            clientID: process.env.LINKEDIN_CLIENT_ID || 'TON_CLIENT_ID',
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET || 'TON_SECRET',
            callbackURL: 'http://localhost:3000/auth/linkedin/callback',
            scope: ['openid', 'profile', 'email'],
        } as any);
    }

    async validate(issuer: string, profile: any, context: any, idToken: string, accessToken: string, refreshToken: string, done: any): Promise<any> {
        try {
            // Normalisation for AuthService
            // passport-openidconnect typically returns profile with emails array if scope requested
            // If not, we might need to map it manually from raw data
            if (!profile.emails && profile._json && profile._json.email) {
                profile.emails = [{ value: profile._json.email }];
            }

            const jwtData = await this.authService.validateOAuthLogin(profile, 'linkedin');
            done(null, jwtData);
        } catch (err) {
            done(err, false);
        }
    }
}