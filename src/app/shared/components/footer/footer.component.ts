import { Component, inject } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-footer.component',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  private readonly themeService = inject(ThemeService);

  currentYear = new Date().getFullYear();

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
