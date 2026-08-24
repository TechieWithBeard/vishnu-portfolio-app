import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { WritingItem } from '../types/portfolio.types';

@Controller('writing')
export class WritingController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get()
  async getWriting(@Query('platform') platform?: string): Promise<WritingItem[]> {
    return this.supabaseService.getWriting(platform);
  }

  @Post()
  async createWriting(
    @Body() body: Omit<WritingItem, 'id'> & { id?: string }
  ): Promise<WritingItem> {
    return this.supabaseService.createWriting(body);
  }

  @Put(':id')
  async updateWriting(
    @Param('id') id: string,
    @Body() body: Partial<WritingItem>
  ): Promise<WritingItem> {
    return this.supabaseService.updateWriting(id, body);
  }

  @Delete(':id')
  async deleteWriting(@Param('id') id: string): Promise<{ success: boolean }> {
    const success = await this.supabaseService.deleteWriting(id);
    return { success };
  }
}
