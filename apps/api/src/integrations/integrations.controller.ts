import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import type { Integration } from './seed-integrations';

@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  getIntegrations(@Query('category') category?: string, @Query('region') region?: string, @Query('q') query?: string) {
    return this.integrationsService.findAll({ category, region, query });
  }

  @Get('summary')
  getSummary() {
    return this.integrationsService.getSummary();
  }

  @Get(':slug')
  getIntegration(@Param('slug') slug: string) {
    return this.integrationsService.findOne(slug);
  }

  @Post()
  createIntegration(@Body() integration: Partial<Integration>) {
    return this.integrationsService.create(integration);
  }

  @Put(':slug')
  updateIntegration(@Param('slug') slug: string, @Body() integration: Partial<Integration>) {
    return this.integrationsService.update(slug, integration);
  }

  @Patch(':slug/connect')
  setConnection(@Param('slug') slug: string, @Body('connected') connected: boolean) {
    return this.integrationsService.setConnection(slug, connected);
  }

  @Post(':slug/sync')
  syncIntegration(@Param('slug') slug: string) {
    return this.integrationsService.sync(slug);
  }

  @Delete(':slug')
  deleteIntegration(@Param('slug') slug: string) {
    return this.integrationsService.remove(slug);
  }
}
