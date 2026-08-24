export interface AppEnvironment {
  production: boolean;
  apiUrl: string;
  enableAnalytics?: boolean;
}

export const environment: AppEnvironment = {
  production: false,
  apiUrl: '/api',
};
