import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get()
  getRoot() {
    return {
      service: 'the-thread-sutra-api',
      status: 'ok',
      message: 'API is running. Use /api/health for health checks and /api/* for API routes.'
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'the-thread-sutra-api'
    };
  }
}
