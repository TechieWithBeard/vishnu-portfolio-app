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
import { ProjectItem } from '../types/portfolio.types';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get()
  async getProjects(
    @Query('featured') featured?: string,
    @Query('category') category?: string
  ): Promise<ProjectItem[]> {
    const featuredOnly = featured === 'true';
    return this.supabaseService.getProjects(featuredOnly, category);
  }

  @Post()
  async createProject(
    @Body() body: Omit<ProjectItem, 'id'> & { id?: string }
  ): Promise<ProjectItem> {
    return this.supabaseService.createProject(body);
  }

  @Put(':id')
  async updateProject(
    @Param('id') id: string,
    @Body() body: Partial<ProjectItem>
  ): Promise<ProjectItem> {
    return this.supabaseService.updateProject(id, body);
  }

  @Delete(':id')
  async deleteProject(@Param('id') id: string): Promise<{ success: boolean }> {
    const success = await this.supabaseService.deleteProject(id);
    return { success };
  }
}
