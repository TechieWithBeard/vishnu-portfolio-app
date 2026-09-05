import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { appRoutes } from './app.routes';
import { APP_CONFIG } from './core/config/app-config.token';
import { environment } from '../environments/environment';
import { providePortfolioWebMcp } from './core/webmcp/webmcp.tools';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      appRoutes,
      withComponentInputBinding(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      })
    ),
    provideHttpClient(withFetch()),
    providePortfolioWebMcp(),
    {
      provide: APP_CONFIG,
      useValue: environment,
    },
  ],
};
