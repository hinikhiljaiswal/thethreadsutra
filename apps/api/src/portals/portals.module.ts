import { Module } from '@nestjs/common';
import { FlipkartController } from './flipkart.controller';
import { FlipkartService } from './flipkart.service';

@Module({
  controllers: [FlipkartController],
  providers: [FlipkartService]
})
export class PortalsModule {}
