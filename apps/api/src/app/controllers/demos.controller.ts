import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { DemoItem } from '../types/portfolio.types';

@Controller('demos')
export class DemosController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get()
  async getDemos(): Promise<DemoItem[]> {
    return this.supabaseService.getDemos();
  }

  @Post()
  async createDemo(
    @Body() body: Omit<DemoItem, 'id'> & { id?: string }
  ): Promise<DemoItem> {
    return this.supabaseService.createDemo(body);
  }

  @Put(':id')
  async updateDemo(
    @Param('id') id: string,
    @Body() body: Partial<DemoItem>
  ): Promise<DemoItem> {
    return this.supabaseService.updateDemo(id, body);
  }

  @Delete(':id')
  async deleteDemo(@Param('id') id: string): Promise<{ success: boolean }> {
    const success = await this.supabaseService.deleteDemo(id);
    return { success };
  }
}
