import { Route } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ExperienceComponent } from './pages/experience/experience.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { DemosComponent } from './pages/demos/demos.component';
import { WritingComponent } from './pages/writing/writing.component';
import { ContactComponent } from './pages/contact/contact.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'experience',
    component: ExperienceComponent,
  },
  {
    path: 'projects',
    component: ProjectsComponent,
  },
  {
    path: 'demos',
    component: DemosComponent,
  },
  {
    path: 'writing',
    component: WritingComponent,
  },
  {
    path: 'contact',
    component: ContactComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
