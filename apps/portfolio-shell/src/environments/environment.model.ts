export interface AppEnvironment {
  production: boolean;
  apiUrl: string;
  mlServiceUrl?: string;
  enableAnalytics?: boolean;
}
