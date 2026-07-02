import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { OmsService } from './oms.service';
import type { OmsSkuMapping } from './seed-oms';

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

  @Get('sku-mappings/:id')
  getSkuMapping(@Param('id') id: string) {
    return this.omsService.findOne(id);
  }

  @Post('sku-mappings')
  createSkuMapping(@Body() mapping: Partial<OmsSkuMapping>) {
    return this.omsService.create(mapping);
  }

  @Post('sku-mappings/bulk')
  bulkSkuMappings(@Body() body: Partial<OmsSkuMapping>[] | { rows?: Partial<OmsSkuMapping>[] }) {
    return this.omsService.bulkUpsert(body);
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
