import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { SequelizeExceptionFilter } from './common/filters/sequelize-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // CORS, pipes, filters ANTES de listen
  app.enableCors({ origin: 'http://localhost:4200' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new SequelizeExceptionFilter());

  // Swagger config
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Football API')
    .setDescription('API para gestionar jugadores FIFA')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'bearer')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // UNA sola vez
  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');
  Logger.log(`✅ Server listening on http://localhost:${port}`);
  Logger.log(`📚 Swagger at http://localhost:${port}/api/docs`);
}

bootstrap();