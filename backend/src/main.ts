import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import session from 'express-session';
import passport from 'passport';
import express from 'express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Créer le répertoire uploads s'il n'existe pas
  const uploadsDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }

  const roomsDir = join(uploadsDir, 'rooms');
  if (!existsSync(roomsDir)) {
    mkdirSync(roomsDir, { recursive: true });
  }

  // Servir les fichiers statiques depuis le dossier uploads
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  
  // Enable CORS for frontend communication
  app.enableCors({
    origin: 'http://localhost:4200', // Allow Angular app
    credentials: true,
  });

  // Enable session middleware for OpenID Connect
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'super-secret-session-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 3600000, // 1 hour
      }
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Enable global validation pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  await app.listen(process.env.PORT ?? 3000);
  console.log(`✅ Server is running on http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`📂 Static files served from: ${uploadsDir}`);
}
bootstrap();
