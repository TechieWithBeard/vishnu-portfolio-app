import { Body, Controller, Get, Post } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

interface SubmitScoreDto {
  score: number;
  playerName?: string;
}

@Controller('arcade')
export class ArcadeController {
  constructor(private readonly supabaseService: SupabaseService) {}

  @Get('high-score')
  async getHighScore(): Promise<{ highScore: number }> {
    const highScore = await this.supabaseService.getArcadeHighScore();
    return { highScore };
  }

  @Post('score')
  async submitScore(
    @Body() body: SubmitScoreDto
  ): Promise<{ success: boolean; highScore: number; isNewRecord: boolean }> {
    const score = Number(body?.score) || 0;
    const playerName = (body?.playerName || 'PacketRunner').trim();
    const result = await this.supabaseService.saveArcadeScore(score, playerName);
    return {
      success: true,
      highScore: result.highScore,
      isNewRecord: result.isNewRecord,
    };
  }
}
