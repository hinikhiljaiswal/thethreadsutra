import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { FlipkartService } from './flipkart.service';

@Controller('portals/flipkart')
export class FlipkartController {
  constructor(private readonly flipkartService: FlipkartService) {}

  @Get('profile')
  getProfile() {
    return this.flipkartService.getProfile();
  }

  @Put('credentials')
  saveCredentials(@Body() body: { appId?: string; appSecret?: string; sellerId?: string; locationId?: string }) {
    return this.flipkartService.saveCredentials(body);
  }

  @Post('token')
  generateToken() {
    return this.flipkartService.generateAccessToken();
  }

  @Post('listings/fetch')
  fetchListings(@Body() body: { skus?: string[] | string }) {
    return this.flipkartService.fetchListings(body.skus);
  }

  @Post('inventory')
  updateInventory(@Body() body: { sku?: string; productId?: string; locationId?: string; inventory?: number }) {
    return this.flipkartService.updateInventory(body);
  }

  @Post('shipments/filter')
  filterShipments(@Body() body: Record<string, unknown>) {
    return this.flipkartService.filterShipments(body);
  }
}
