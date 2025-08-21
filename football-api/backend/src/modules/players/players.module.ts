import { Module } from '@nestjs/common';
import { PlayersService } from './players.service';
import { PlayersController } from './players.controller';
import { SequelizePlayerRepository } from './repositories/sequelize/sequelize-player.repository';
import { PlayerModel } from './repositories/sequelize/player.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    SequelizeModule.forFeature([PlayerModel]),

    MulterModule.register({
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  ],
  controllers: [PlayersController],
  providers: [
    PlayersService,
    {
      provide: 'IPlayerRepository',
      useClass: SequelizePlayerRepository,
    },
  ],
})
export class PlayersModule {}
