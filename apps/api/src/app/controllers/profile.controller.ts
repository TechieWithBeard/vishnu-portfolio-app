import { Body, Controller, Get, Put } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ProfileData } from '../types/portfolio.types';

@Controller('profile')
export class ProfileController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get()
  async getProfile(): Promise<ProfileData> {
    return this.supabaseService.getProfile();
  }

  @Put()
  async updateProfile(@Body() body: Partial<ProfileData>): Promise<ProfileData> {
    return this.supabaseService.updateProfile(body);
  }
}
