import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PortfolioApiService } from './portfolio-api.service';
import { APP_CONFIG } from '../core/config/app-config.token';

describe('PortfolioApiService On-Demand Fetching', () => {
  let service: PortfolioApiService;
  let httpMock: HttpTestingController;

  const mockConfig = {
    apiUrl: 'http://localhost:3333/api',
    chatApiUrl: 'http://localhost:3333/api/chat',
    production: false,
    analyticsId: '',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PortfolioApiService,
        { provide: APP_CONFIG, useValue: mockConfig },
      ],
    });

    service = TestBed.inject(PortfolioApiService);
    httpMock = TestBed.inject(HttpTestingController);

    // Drain initial startup calls (profile, skills, high-score)
    const initProfile = httpMock.expectOne('http://localhost:3333/api/profile');
    initProfile.flush({});
    const initSkills = httpMock.expectOne('http://localhost:3333/api/skills');
    initSkills.flush([]);
    const initHighScore = httpMock.expectOne('http://localhost:3333/api/arcade/high-score');
    initHighScore.flush({ highScore: 240 });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should not fetch heavy sections on initial startup', () => {
    expect(service.experienceLoaded()).toBe(false);
    expect(service.projectsLoaded()).toBe(false);
    expect(service.demosLoaded()).toBe(false);
    expect(service.writingLoaded()).toBe(false);
  });

  it('should fetch experience on-demand when requested', () => {
    expect(service.experienceLoaded()).toBe(false);

    service.fetchExperience();
    expect(service.loadingExperience()).toBe(true);

    const req = httpMock.expectOne('http://localhost:3333/api/experience');
    expect(req.request.method).toBe('GET');
    req.flush([
      {
        id: 'exp-1',
        company: 'AVEVA',
        role: 'Senior Staff Frontend Architect',
        period: '2022 - Present',
        location: 'Global',
        highlights: ['Nx Monorepo scaling'],
        tech: ['Angular 22', 'TypeScript'],
      },
    ]);

    expect(service.experienceLoaded()).toBe(true);
    expect(service.loadingExperience()).toBe(false);
    expect(service.experience().length).toBe(1);
    expect(service.experience()[0].company).toBe('AVEVA');
  });

  it('should cache experience and not duplicate network calls on subsequent requests', () => {
    service.fetchExperience();
    const req = httpMock.expectOne('http://localhost:3333/api/experience');
    req.flush([]);

    expect(service.experienceLoaded()).toBe(true);

    // Call again without force: no HTTP request should be fired
    service.fetchExperience();
    httpMock.expectNone('http://localhost:3333/api/experience');
  });

  it('should dispatch correct on-demand fetch based on route', () => {
    expect(service.demosLoaded()).toBe(false);

    service.fetchForRoute('/demos');
    const reqDemos = httpMock.expectOne('http://localhost:3333/api/demos');
    reqDemos.flush([]);
    expect(service.demosLoaded()).toBe(true);

    service.fetchForRoute('/writing');
    const reqWriting = httpMock.expectOne('http://localhost:3333/api/writing');
    reqWriting.flush([]);
    expect(service.writingLoaded()).toBe(true);
  });

  it('should reflect loading state reactively in computed loading signal', () => {
    expect(service.loading()).toBe(false);

    service.fetchProjects();
    expect(service.loadingProjects()).toBe(true);
    expect(service.loading()).toBe(true);

    const req = httpMock.expectOne('http://localhost:3333/api/projects');
    req.flush([]);

    expect(service.loadingProjects()).toBe(false);
    expect(service.loading()).toBe(false);
  });
});
