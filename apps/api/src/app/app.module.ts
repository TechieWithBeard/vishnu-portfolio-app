import { Module } from '@nestjs/common';
import { SupabaseService } from './supabase/supabase.service';
import { ProfileController } from './controllers/profile.controller';
import { ExperienceController } from './controllers/experience.controller';
import { ProjectsController } from './controllers/projects.controller';
import { WritingController } from './controllers/writing.controller';
import { DemosController } from './controllers/demos.controller';
import { SkillsController } from './controllers/skills.controller';
import { SeedController, HealthController } from './controllers/seed.controller';
import { ArcadeController } from './controllers/arcade.controller';

import { McpModule } from './mcp/mcp.module';

@Module({
  imports: [McpModule],
  controllers: [
    HealthController,
    ProfileController,
    ExperienceController,
    ProjectsController,
    WritingController,
    DemosController,
    SkillsController,
    SeedController,
    ArcadeController,
  ],
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class AppModule {}
