import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Ce décorateur magique rend le module accessible partout
@Module({
    providers: [PrismaService],
    exports: [PrismaService], // On l'exporte pour que les autres modules puissent l'injecter
})
export class SharedModule {}