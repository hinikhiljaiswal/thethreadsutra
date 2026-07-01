import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CatalogModule } from './catalog/catalog.module';
import { HealthController } from './health.controller';
import { IntegrationsModule } from './integrations/integrations.module';
import { OmsModule } from './oms/oms.module';
import { PortalsModule } from './portals/portals.module';

const databaseImports = process.env.MONGODB_URI
  ? [
      MongooseModule.forRootAsync({
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          uri: config.getOrThrow<string>('MONGODB_URI'),
          retryAttempts: 2,
          serverSelectionTimeoutMS: 3000
        })
      })
    ]
  : [];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ...databaseImports,
    CatalogModule,
    IntegrationsModule,
    OmsModule,
    PortalsModule
  ],
  controllers: [HealthController]
})
export class AppModule {}
