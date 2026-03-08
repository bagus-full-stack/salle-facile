import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';

@Module({
    // On déclare ici les contrôleurs qui gèrent les routes HTTP de ce module
    controllers: [RoomsController],

    // On déclare ici les services (qui contiennent la logique métier)
    providers: [RoomsService],

    // Si un autre module avait besoin du RoomsService (par exemple le module Réservation
    // pour vérifier l'existence d'une salle), on l'exporterait ici :
    // exports: [RoomsService]
})
export class RoomsModule {}