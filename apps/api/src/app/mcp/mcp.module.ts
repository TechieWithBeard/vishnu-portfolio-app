import { Module } from '@nestjs/common';
import { McpController } from './mcp.controller';
import { McpService } from './mcp.service';
import { SupabaseService } from '../supabase/supabase.service';

@Module({
  controllers: [McpController],
  providers: [McpService, SupabaseService],
  exports: [McpService],
})
export class McpModule {}
