import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            // On dit à Passport d'aller chercher le token dans le header "Bearer"
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false, // On refuse les tokens expirés
            // La clé secrète (doit être la même que celle utilisée pour signer le token)
            secretOrKey: process.env.JWT_SECRET || 'MA_CLE_SECRETE_TRES_COMPLEXE_A_CHANGER_EN_PROD',
        });
    }

    // Cette méthode est appelée AUTOMATIQUEMENT si le token est valide
    async validate(payload: any) {
        console.log('Validating JWT payload:', payload);
        // Le 'payload' est le contenu décodé de notre JWT.
        // Ce que l'on retourne ici sera injecté par NestJS directement dans "req.user" !
        return {
            sub: payload.sub, // Le vrai ID de l'utilisateur
            email: payload.email,
            role: payload.role
        };
    }
}