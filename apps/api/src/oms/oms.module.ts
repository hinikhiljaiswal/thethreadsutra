import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OmsController } from './oms.controller';
import { OmsService } from './oms.service';
import {
  OmsAuditEventModel,
  OmsAuditEventSchema,
  OmsOrderModel,
  OmsOrderSchema,
  OmsSkuMappingModel,
  OmsSkuMappingSchema,
  OmsWaveModel,
  OmsWaveSchema
} from './schemas/oms.schema';

const databaseImports = process.env.MONGODB_URI
  ? [
      MongooseModule.forFeature([
        { name: OmsSkuMappingModel.name, schema: OmsSkuMappingSchema },
        { name: OmsOrderModel.name, schema: OmsOrderSchema },
        { name: OmsWaveModel.name, schema: OmsWaveSchema },
        { name: OmsAuditEventModel.name, schema: OmsAuditEventSchema }
      ])
    ]
  : [];

@Module({
  imports: databaseImports,
  controllers: [OmsController],
  providers: [OmsService]
})
export class OmsModule {}
