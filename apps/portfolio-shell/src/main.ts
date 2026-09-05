import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environments/environment';
import { initWebMcp } from './app/core/webmcp/webmcp.init';

// Initialize WebMCP In-Browser Agent API
initWebMcp(environment.apiUrl);

bootstrapApplication(App, appConfig).catch((err) =>
  console.error(err)
);
