import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {DecimalPipe} from '@angular/common';
import { projects, resume } from '../../data/portfolio.data';

@Component({
  selector: 'app-home',
  imports: [RouterLink,DecimalPipe],
  templateUrl: "./home.component.html",
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  protected readonly profile = resume;
  readonly currentYear = new Date().getFullYear();
  protected readonly featuredProjects = projects.filter((project) => project.featured).slice(0, 3);
  protected readonly architectureSkills = resume.skills['frontendArchitecture'];
}
