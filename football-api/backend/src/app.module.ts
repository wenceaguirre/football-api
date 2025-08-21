// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import sequelizeConfig from './config/sequelize.config';
import { PlayersModule } from './modules/players/players.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SequelizeModule.forRoot(sequelizeConfig),
    PlayersModule,
    AuthModule,
    UserModule,
  ],
  controllers: [],
  providers: [{provide: APP_GUARD, useClass: JwtAuthGuard}],
})
export class AppModule {
  constructor() {
    console.log('Sequelize config loaded:', sequelizeConfig.models);
  }
}
