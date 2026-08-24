import { Body, Controller, Get, Put } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { SkillCategoryItem } from '../types/portfolio.types';

@Controller('skills')
export class SkillsController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get()
  async getSkills(): Promise<SkillCategoryItem[]> {
    return this.supabaseService.getSkills();
  }

  @Put()
  async updateSkills(
    @Body() categories: SkillCategoryItem[]
  ): Promise<SkillCategoryItem[]> {
    return this.supabaseService.updateSkills(categories);
  }
}
