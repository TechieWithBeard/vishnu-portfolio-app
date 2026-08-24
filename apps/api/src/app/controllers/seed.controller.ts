import { Controller, Get, Post } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Post()
  async seedAll() {
    return this.supabaseService.seedAll();
  }
}

@Controller('health')
export class HealthController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get()
  getHealth() {
    return this.supabaseService.getHealthStatus();
  }
}
