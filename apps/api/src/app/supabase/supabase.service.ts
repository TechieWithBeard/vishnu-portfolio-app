import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  ProfileData,
  ExperienceItem,
  ProjectItem,
  WritingItem,
  DemoItem,
  SkillCategoryItem,
} from '../types/portfolio.types';
import {
  initialProfile,
  initialExperience,
  initialProjects,
  initialWriting,
  initialDemos,
  initialSkills,
} from '../data/initial-data';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient | null = null;
  private isSupabaseConnected = false;

  // Local In-Memory Fallback & Sync Cache
  private profileStore: ProfileData = { ...initialProfile };
  private experienceStore: ExperienceItem[] = [...initialExperience];
  private projectsStore: ProjectItem[] = [...initialProjects];
  private writingStore: WritingItem[] = [...initialWriting];
  private demosStore: DemoItem[] = [...initialDemos];
  private skillsStore: SkillCategoryItem[] = [...initialSkills];

  onModuleInit() {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes('YOUR_')) {
      try {
        this.client = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false },
        });
        this.isSupabaseConnected = true;
        this.logger.log(`✅ Supabase client initialized with URL: ${supabaseUrl}`);
        this.syncFromSupabase();
      } catch (err: any) {
        this.logger.warn(`⚠️ Failed to initialize Supabase client: ${err.message}. Using Local Store.`);
      }
    } else {
      this.logger.log('ℹ️ No Supabase credentials configured. Running in Local Store mode.');
    }
  }

  private async syncFromSupabase(): Promise<void> {
    if (!this.client) return;
    try {
      // Profile
      const { data: pData } = await this.client.from('profile').select('*').limit(1).single();
      if (pData) {
        this.profileStore = {
          id: pData.id,
          name: pData.name,
          alias: pData.alias,
          title: pData.title,
          tagline: pData.tagline,
          location: pData.location,
          email: pData.email,
          phone: pData.phone,
          linkedin: pData.linkedin,
          github: pData.github,
          summary: pData.summary,
          availability: pData.availability || initialProfile.availability,
          skills: pData.skills || initialProfile.skills,
          updatedAt: pData.updated_at,
        };
      }

      // Experience
      const { data: eData } = await this.client
        .from('experience')
        .select('*')
        .order('order_index', { ascending: true });
      if (eData && eData.length > 0) {
        this.experienceStore = eData.map((item: any) => ({
          id: item.id,
          role: item.role,
          company: item.company,
          period: item.period,
          location: item.location,
          highlights: item.highlights || [],
          tech: item.tech || [],
          orderIndex: item.order_index ?? 0,
        }));
      }

      // Projects
      const { data: prData } = await this.client
        .from('projects')
        .select('*')
        .order('order_index', { ascending: true });
      if (prData && prData.length > 0) {
        this.projectsStore = prData.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          role: item.role,
          tech: item.tech || [],
          highlights: item.highlights || [],
          github: item.github,
          liveDemo: item.live_demo,
          demoType: item.demo_type,
          featured: item.featured ?? false,
          category: item.category || 'Architecture',
          orderIndex: item.order_index ?? 0,
        }));
      }

      // Writing
      const { data: wData } = await this.client
        .from('writing')
        .select('*')
        .order('order_index', { ascending: true });
      if (wData && wData.length > 0) {
        this.writingStore = wData.map((item: any) => ({
          id: item.id,
          title: item.title,
          platform: item.platform,
          url: item.url,
          publishedAt: item.published_at,
          summary: item.summary,
          tags: item.tags || [],
          thumbnail: item.thumbnail,
          readTime: item.read_time,
          featured: item.featured ?? false,
          orderIndex: item.order_index ?? 0,
        }));
      }

      // Demos
      const { data: dData } = await this.client
        .from('demos')
        .select('*')
        .order('order_index', { ascending: true });
      if (dData && dData.length > 0) {
        this.demosStore = dData.map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          type: item.type,
          remoteName: item.remote_name,
          exposedModule: item.exposed_module,
          url: item.url,
          status: item.status,
          tech: item.tech || [],
          tags: item.tags || [],
          sandbox: item.sandbox,
          orderIndex: item.order_index ?? 0,
        }));
      }

      // Skills
      const { data: sData } = await this.client
        .from('skills')
        .select('*')
        .order('order_index', { ascending: true });
      if (sData && sData.length > 0) {
        this.skillsStore = sData.map((item: any) => ({
          id: item.id,
          category: item.category,
          categoryLabel: item.category_label,
          items: item.items || [],
          orderIndex: item.order_index ?? 0,
        }));
      }

      this.logger.log('✨ Data successfully synced from Supabase Cloud');
    } catch (error: any) {
      this.logger.warn(`Failed to sync from Supabase: ${error.message}. Retaining local store.`);
    }
  }

  // --- HEALTH & STATUS ---
  getHealthStatus() {
    return {
      status: 'ok',
      storageMode: this.isSupabaseConnected ? 'supabase' : 'local-store',
      supabaseConfigured: this.isSupabaseConnected,
      counts: {
        experience: this.experienceStore.length,
        projects: this.projectsStore.length,
        writing: this.writingStore.length,
        demos: this.demosStore.length,
        skillCategories: this.skillsStore.length,
      },
      timestamp: new Date().toISOString(),
    };
  }

  // --- PROFILE ---
  async getProfile(): Promise<ProfileData> {
    return this.profileStore;
  }

  async updateProfile(profile: Partial<ProfileData>): Promise<ProfileData> {
    this.profileStore = {
      ...this.profileStore,
      ...profile,
      updatedAt: new Date().toISOString(),
    };

    if (this.client) {
      try {
        await this.client.from('profile').upsert({
          id: this.profileStore.id || 'default',
          name: this.profileStore.name,
          alias: this.profileStore.alias,
          title: this.profileStore.title,
          tagline: this.profileStore.tagline,
          location: this.profileStore.location,
          email: this.profileStore.email,
          phone: this.profileStore.phone,
          linkedin: this.profileStore.linkedin,
          github: this.profileStore.github,
          summary: this.profileStore.summary,
          availability: this.profileStore.availability,
          skills: this.profileStore.skills,
          updated_at: new Date().toISOString(),
        });
      } catch (err: any) {
        this.logger.warn(`Supabase updateProfile error: ${err.message}`);
      }
    }

    return this.profileStore;
  }

  // --- EXPERIENCE ---
  async getExperience(): Promise<ExperienceItem[]> {
    return [...this.experienceStore].sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async createExperience(item: Omit<ExperienceItem, 'id'> & { id?: string }): Promise<ExperienceItem> {
    const newItem: ExperienceItem = {
      id: item.id || `exp-${Date.now()}`,
      role: item.role,
      company: item.company,
      period: item.period,
      location: item.location,
      highlights: item.highlights || [],
      tech: item.tech || [],
      orderIndex: item.orderIndex ?? this.experienceStore.length + 1,
    };

    this.experienceStore.push(newItem);

    if (this.client) {
      try {
        await this.client.from('experience').insert({
          id: newItem.id,
          role: newItem.role,
          company: newItem.company,
          period: newItem.period,
          location: newItem.location,
          highlights: newItem.highlights,
          tech: newItem.tech,
          order_index: newItem.orderIndex,
        });
      } catch (err: any) {
        this.logger.warn(`Supabase createExperience error: ${err.message}`);
      }
    }

    return newItem;
  }

  async updateExperience(id: string, updates: Partial<ExperienceItem>): Promise<ExperienceItem> {
    const index = this.experienceStore.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error(`Experience with id '${id}' not found`);
    }

    this.experienceStore[index] = {
      ...this.experienceStore[index],
      ...updates,
    };

    const updated = this.experienceStore[index];

    if (this.client) {
      try {
        await this.client
          .from('experience')
          .update({
            role: updated.role,
            company: updated.company,
            period: updated.period,
            location: updated.location,
            highlights: updated.highlights,
            tech: updated.tech,
            order_index: updated.orderIndex,
          })
          .eq('id', id);
      } catch (err: any) {
        this.logger.warn(`Supabase updateExperience error: ${err.message}`);
      }
    }

    return updated;
  }

  async deleteExperience(id: string): Promise<boolean> {
    const index = this.experienceStore.findIndex((e) => e.id === id);
    if (index === -1) return false;

    this.experienceStore.splice(index, 1);

    if (this.client) {
      try {
        await this.client.from('experience').delete().eq('id', id);
      } catch (err: any) {
        this.logger.warn(`Supabase deleteExperience error: ${err.message}`);
      }
    }

    return true;
  }

  // --- PROJECTS ---
  async getProjects(featuredOnly = false, category?: string): Promise<ProjectItem[]> {
    let result = [...this.projectsStore].sort((a, b) => a.orderIndex - b.orderIndex);
    if (featuredOnly) {
      result = result.filter((p) => p.featured);
    }
    if (category) {
      result = result.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    return result;
  }

  async createProject(item: Omit<ProjectItem, 'id'> & { id?: string }): Promise<ProjectItem> {
    const newItem: ProjectItem = {
      id: item.id || `proj-${Date.now()}`,
      title: item.title,
      description: item.description,
      role: item.role || 'Senior Frontend Engineer',
      tech: item.tech || [],
      highlights: item.highlights || [],
      github: item.github ?? null,
      liveDemo: item.liveDemo ?? null,
      demoType: item.demoType || 'native-federation',
      featured: item.featured ?? false,
      category: item.category || 'Architecture',
      orderIndex: item.orderIndex ?? this.projectsStore.length + 1,
    };

    this.projectsStore.push(newItem);

    if (this.client) {
      try {
        await this.client.from('projects').insert({
          id: newItem.id,
          title: newItem.title,
          description: newItem.description,
          role: newItem.role,
          tech: newItem.tech,
          highlights: newItem.highlights,
          github: newItem.github,
          live_demo: newItem.liveDemo,
          demo_type: newItem.demoType,
          featured: newItem.featured,
          category: newItem.category,
          order_index: newItem.orderIndex,
        });
      } catch (err: any) {
        this.logger.warn(`Supabase createProject error: ${err.message}`);
      }
    }

    return newItem;
  }

  async updateProject(id: string, updates: Partial<ProjectItem>): Promise<ProjectItem> {
    const index = this.projectsStore.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error(`Project with id '${id}' not found`);
    }

    this.projectsStore[index] = {
      ...this.projectsStore[index],
      ...updates,
    };

    const updated = this.projectsStore[index];

    if (this.client) {
      try {
        await this.client
          .from('projects')
          .update({
            title: updated.title,
            description: updated.description,
            role: updated.role,
            tech: updated.tech,
            highlights: updated.highlights,
            github: updated.github,
            live_demo: updated.liveDemo,
            demo_type: updated.demoType,
            featured: updated.featured,
            category: updated.category,
            order_index: updated.orderIndex,
          })
          .eq('id', id);
      } catch (err: any) {
        this.logger.warn(`Supabase updateProject error: ${err.message}`);
      }
    }

    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    const index = this.projectsStore.findIndex((p) => p.id === id);
    if (index === -1) return false;

    this.projectsStore.splice(index, 1);

    if (this.client) {
      try {
        await this.client.from('projects').delete().eq('id', id);
      } catch (err: any) {
        this.logger.warn(`Supabase deleteProject error: ${err.message}`);
      }
    }

    return true;
  }

  // --- WRITING / ARTICLES ---
  async getWriting(platform?: string): Promise<WritingItem[]> {
    let result = [...this.writingStore].sort((a, b) => a.orderIndex - b.orderIndex);
    if (platform) {
      result = result.filter((w) => w.platform.toLowerCase() === platform.toLowerCase());
    }
    return result;
  }

  async createWriting(item: Omit<WritingItem, 'id'> & { id?: string }): Promise<WritingItem> {
    const newItem: WritingItem = {
      id: item.id || `art-${Date.now()}`,
      title: item.title,
      platform: item.platform || 'medium',
      url: item.url,
      publishedAt: item.publishedAt || new Date().toISOString().split('T')[0],
      summary: item.summary,
      tags: item.tags || [],
      thumbnail: item.thumbnail,
      readTime: item.readTime || '5 min read',
      featured: item.featured ?? true,
      orderIndex: item.orderIndex ?? this.writingStore.length + 1,
    };

    this.writingStore.push(newItem);

    if (this.client) {
      try {
        await this.client.from('writing').insert({
          id: newItem.id,
          title: newItem.title,
          platform: newItem.platform,
          url: newItem.url,
          published_at: newItem.publishedAt,
          summary: newItem.summary,
          tags: newItem.tags,
          thumbnail: newItem.thumbnail,
          read_time: newItem.readTime,
          featured: newItem.featured,
          order_index: newItem.orderIndex,
        });
      } catch (err: any) {
        this.logger.warn(`Supabase createWriting error: ${err.message}`);
      }
    }

    return newItem;
  }

  async updateWriting(id: string, updates: Partial<WritingItem>): Promise<WritingItem> {
    const index = this.writingStore.findIndex((w) => w.id === id);
    if (index === -1) {
      throw new Error(`Writing article with id '${id}' not found`);
    }

    this.writingStore[index] = {
      ...this.writingStore[index],
      ...updates,
    };

    const updated = this.writingStore[index];

    if (this.client) {
      try {
        await this.client
          .from('writing')
          .update({
            title: updated.title,
            platform: updated.platform,
            url: updated.url,
            published_at: updated.publishedAt,
            summary: updated.summary,
            tags: updated.tags,
            thumbnail: updated.thumbnail,
            read_time: updated.readTime,
            featured: updated.featured,
            order_index: updated.orderIndex,
          })
          .eq('id', id);
      } catch (err: any) {
        this.logger.warn(`Supabase updateWriting error: ${err.message}`);
      }
    }

    return updated;
  }

  async deleteWriting(id: string): Promise<boolean> {
    const index = this.writingStore.findIndex((w) => w.id === id);
    if (index === -1) return false;

    this.writingStore.splice(index, 1);

    if (this.client) {
      try {
        await this.client.from('writing').delete().eq('id', id);
      } catch (err: any) {
        this.logger.warn(`Supabase deleteWriting error: ${err.message}`);
      }
    }

    return true;
  }

  // --- DEMOS ---
  async getDemos(): Promise<DemoItem[]> {
    return [...this.demosStore].sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async createDemo(item: Omit<DemoItem, 'id'> & { id?: string }): Promise<DemoItem> {
    const newItem: DemoItem = {
      id: item.id || `demo-${Date.now()}`,
      title: item.title,
      description: item.description,
      type: item.type || 'native-federation',
      remoteName: item.remoteName,
      exposedModule: item.exposedModule,
      url: item.url,
      status: item.status || 'live',
      tech: item.tech || [],
      tags: item.tags || [],
      sandbox: item.sandbox,
      orderIndex: item.orderIndex ?? this.demosStore.length + 1,
    };

    this.demosStore.push(newItem);

    if (this.client) {
      try {
        await this.client.from('demos').insert({
          id: newItem.id,
          title: newItem.title,
          description: newItem.description,
          type: newItem.type,
          remote_name: newItem.remoteName,
          exposed_module: newItem.exposedModule,
          url: newItem.url,
          status: newItem.status,
          tech: newItem.tech,
          tags: newItem.tags,
          sandbox: newItem.sandbox,
          order_index: newItem.orderIndex,
        });
      } catch (err: any) {
        this.logger.warn(`Supabase createDemo error: ${err.message}`);
      }
    }

    return newItem;
  }

  async updateDemo(id: string, updates: Partial<DemoItem>): Promise<DemoItem> {
    const index = this.demosStore.findIndex((d) => d.id === id);
    if (index === -1) {
      throw new Error(`Demo with id '${id}' not found`);
    }

    this.demosStore[index] = {
      ...this.demosStore[index],
      ...updates,
    };

    const updated = this.demosStore[index];

    if (this.client) {
      try {
        await this.client
          .from('demos')
          .update({
            title: updated.title,
            description: updated.description,
            type: updated.type,
            remote_name: updated.remoteName,
            exposed_module: updated.exposedModule,
            url: updated.url,
            status: updated.status,
            tech: updated.tech,
            tags: updated.tags,
            sandbox: updated.sandbox,
            order_index: updated.orderIndex,
          })
          .eq('id', id);
      } catch (err: any) {
        this.logger.warn(`Supabase updateDemo error: ${err.message}`);
      }
    }

    return updated;
  }

  async deleteDemo(id: string): Promise<boolean> {
    const index = this.demosStore.findIndex((d) => d.id === id);
    if (index === -1) return false;

    this.demosStore.splice(index, 1);

    if (this.client) {
      try {
        await this.client.from('demos').delete().eq('id', id);
      } catch (err: any) {
        this.logger.warn(`Supabase deleteDemo error: ${err.message}`);
      }
    }

    return true;
  }

  // --- SKILLS ---
  async getSkills(): Promise<SkillCategoryItem[]> {
    return [...this.skillsStore].sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async updateSkills(categories: SkillCategoryItem[]): Promise<SkillCategoryItem[]> {
    this.skillsStore = [...categories];

    if (this.client) {
      try {
        for (const cat of categories) {
          await this.client.from('skills').upsert({
            id: cat.id,
            category: cat.category,
            category_label: cat.categoryLabel,
            items: cat.items,
            order_index: cat.orderIndex,
          });
        }
      } catch (err: any) {
        this.logger.warn(`Supabase updateSkills error: ${err.message}`);
      }
    }

    return this.skillsStore;
  }

  // --- SEED DATABASE ---
  async seedAll(): Promise<{ success: boolean; message: string }> {
    this.profileStore = { ...initialProfile };
    this.experienceStore = [...initialExperience];
    this.projectsStore = [...initialProjects];
    this.writingStore = [...initialWriting];
    this.demosStore = [...initialDemos];
    this.skillsStore = [...initialSkills];

    if (this.client) {
      try {
        // Upsert profile
        await this.client.from('profile').upsert({
          id: initialProfile.id,
          name: initialProfile.name,
          alias: initialProfile.alias,
          title: initialProfile.title,
          tagline: initialProfile.tagline,
          location: initialProfile.location,
          email: initialProfile.email,
          phone: initialProfile.phone,
          linkedin: initialProfile.linkedin,
          github: initialProfile.github,
          summary: initialProfile.summary,
          availability: initialProfile.availability,
          skills: initialProfile.skills,
        });

        // Insert experience
        for (const item of initialExperience) {
          await this.client.from('experience').upsert({
            id: item.id,
            role: item.role,
            company: item.company,
            period: item.period,
            location: item.location,
            highlights: item.highlights,
            tech: item.tech,
            order_index: item.orderIndex,
          });
        }

        // Insert projects
        for (const item of initialProjects) {
          await this.client.from('projects').upsert({
            id: item.id,
            title: item.title,
            description: item.description,
            role: item.role,
            tech: item.tech,
            highlights: item.highlights,
            github: item.github,
            live_demo: item.liveDemo,
            demo_type: item.demoType,
            featured: item.featured,
            category: item.category,
            order_index: item.orderIndex,
          });
        }

        // Insert writing
        for (const item of initialWriting) {
          await this.client.from('writing').upsert({
            id: item.id,
            title: item.title,
            platform: item.platform,
            url: item.url,
            published_at: item.publishedAt,
            summary: item.summary,
            tags: item.tags,
            thumbnail: item.thumbnail,
            read_time: item.readTime,
            featured: item.featured,
            order_index: item.orderIndex,
          });
        }

        // Insert demos
        for (const item of initialDemos) {
          await this.client.from('demos').upsert({
            id: item.id,
            title: item.title,
            description: item.description,
            type: item.type,
            remote_name: item.remoteName,
            exposed_module: item.exposedModule,
            url: item.url,
            status: item.status,
            tech: item.tech,
            tags: item.tags,
            sandbox: item.sandbox,
            order_index: item.orderIndex,
          });
        }

        // Insert skills
        for (const item of initialSkills) {
          await this.client.from('skills').upsert({
            id: item.id,
            category: item.category,
            category_label: item.categoryLabel,
            items: item.items,
            order_index: item.orderIndex,
          });
        }

        return { success: true, message: 'Seeded Supabase database and local store successfully' };
      } catch (err: any) {
        return {
          success: true,
          message: `Local store seeded. Supabase sync warning: ${err.message}`,
        };
      }
    }

    return { success: true, message: 'Local store seeded successfully' };
  }
}
