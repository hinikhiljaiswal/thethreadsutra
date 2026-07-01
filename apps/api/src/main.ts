import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const configuredOrigins = (config.get<string>('CORS_ORIGIN') ?? '*')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin(origin, callback) {
      if (!origin || configuredOrigins.includes('*')) {
        callback(null, true);
        return;
      }

      const isConfigured = configuredOrigins.includes(origin);
      const isLocalhost = /^http:\/\/localhost:\d+$/i.test(origin);
      const isRenderWeb = /^https:\/\/[a-z0-9-]+\.onrender\.com$/i.test(origin);
      const isThreadSutraDomain = /^https:\/\/([a-z0-9-]+\.)?thethreadsutra\.com$/i.test(origin);

      callback(null, isConfigured || isLocalhost || isRenderWeb || isThreadSutraDomain);
    },
    credentials: true
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true
    })
  );
  app.setGlobalPrefix('api', {
    exclude: [{ path: '/', method: RequestMethod.GET }]
  });

  await app.listen(config.get<number>('PORT') ?? 4000);
}

bootstrap();
