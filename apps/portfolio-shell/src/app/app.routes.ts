import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'experience',
    loadComponent: () => import('./pages/experience/experience.component').then((m) => m.ExperienceComponent),
  },
  {
    path: 'projects',
    loadComponent: () => import('./pages/projects/projects.component').then((m) => m.ProjectsComponent),
  },
  {
    path: 'demos',
    loadComponent: () => import('./pages/demos/demos.component').then((m) => m.DemosComponent),
  },
  {
    path: 'writing',
    loadComponent: () => import('./pages/writing/writing.component').then((m) => m.WritingComponent),
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact.component').then((m) => m.ContactComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
