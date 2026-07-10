import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { OmsService } from './oms.service';
import type { OmsOrderStatus, OmsSkuMapping } from './seed-oms';

@Controller('oms')
export class OmsController {
  constructor(private readonly omsService: OmsService) {}

  @Get('sku-mappings')
  getSkuMappings(
    @Query('q') query?: string,
    @Query('marketplace') marketplace?: string,
    @Query('brand') brand?: string,
    @Query('category') category?: string,
    @Query('barcode') barcode?: string
  ) {
    return this.omsService.findSkuMappings({ query, marketplace, brand, category, barcode });
  }

  @Get('summary')
  getSummary() {
    return this.omsService.getSummary();
  }

  @Get('orders')
  getOrders(
    @Query('q') query?: string,
    @Query('channel') channel?: string,
    @Query('status') status?: string
  ) {
    return this.omsService.findOrders({ query, channel, status });
  }

  @Get('orders/channels')
  getOrderChannels() {
    return this.omsService.getOrderChannels();
  }

  @Post('orders/status')
  updateOrderStatuses(@Body() body: { ids?: string[]; status?: OmsOrderStatus; query?: string; channel?: string }) {
    return this.omsService.updateOrderStatuses(body);
  }

  @Get('waves')
  getWaves() {
    return this.omsService.findWaves();
  }

  @Post('waves')
  generateWave(@Body() body: Record<string, string>) {
    return this.omsService.generateWave(body);
  }

  @Get('sku-mappings/:id')
  getSkuMapping(@Param('id') id: string) {
    return this.omsService.findOne(id);
  }

  @Post('sku-mappings/bulk')
  bulkSkuMappings(@Body() body: Partial<OmsSkuMapping>[] | { rows?: Partial<OmsSkuMapping>[] }) {
    return this.omsService.bulkUpsert(body);
  }

  @Post('sku-mappings')
  createSkuMapping(@Body() mapping: Partial<OmsSkuMapping>) {
    return this.omsService.create(mapping);
  }

  @Put('sku-mappings/:id')
  updateSkuMapping(@Param('id') id: string, @Body() mapping: Partial<OmsSkuMapping>) {
    return this.omsService.update(id, mapping);
  }

  @Delete('sku-mappings/:id')
  deleteSkuMapping(@Param('id') id: string) {
    return this.omsService.remove(id);
  }
}
