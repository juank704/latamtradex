import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'OK',
      service: 'API Gateway',
      timestamp: new Date().toISOString(),
    };
  }
}
