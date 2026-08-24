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
import { ExperienceItem } from '../types/portfolio.types';

@Controller('experience')
export class ExperienceController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get()
  async getExperience(): Promise<ExperienceItem[]> {
    return this.supabaseService.getExperience();
  }

  @Post()
  async createExperience(
    @Body() body: Omit<ExperienceItem, 'id'> & { id?: string }
  ): Promise<ExperienceItem> {
    return this.supabaseService.createExperience(body);
  }

  @Put(':id')
  async updateExperience(
    @Param('id') id: string,
    @Body() body: Partial<ExperienceItem>
  ): Promise<ExperienceItem> {
    return this.supabaseService.updateExperience(id, body);
  }

  @Delete(':id')
  async deleteExperience(@Param('id') id: string): Promise<{ success: boolean }> {
    const success = await this.supabaseService.deleteExperience(id);
    return { success };
  }
}
