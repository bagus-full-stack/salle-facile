import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {SharedModule} from "./shared/shared.module";
import {RoomsModule} from "./modules/rooms/rooms.module";
import {EventEmitterModule} from "@nestjs/event-emitter";
import {MailerModule} from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import {UsersModule} from "./modules/users/users.module";

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    MailerModule.forRoot({  // Configuration du serveur d'envoi d'emails
      transport: {
        host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
        port: Number(process.env.SMTP_PORT) || 2525,
        auth: {
          user: process.env.SMTP_USER || 'ton_user',
          pass: process.env.SMTP_PASS || 'ton_password',
        },
      },
      defaults: {
        from: '"SalleFacile" <noreply@sallefacile.com>',
      },
      template: {
        dir: __dirname + '/templates', // Dossier où l'on va stocker nos templates HTML
        adapter: new HandlebarsAdapter(),
        options: { strict: true },
      },
    }),
    SharedModule, // Le PrismaService est maintenant injecté globalement !
    RoomsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
