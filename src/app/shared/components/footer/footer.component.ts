import { Component, inject } from '@angular/core';
import { ThemeService } from '../../../core/services/theme/theme.service';

@Component({
  selector: 'app-footer',
  imports: [],
  template: `
    <footer class="footer">
      <div class="footer-content">
        <p>&copy; {{ currentYear }} SmartKoszyka. All rights reserved.</p>
      </div>
    </footer>
  `,
  styles: [
    `
      @use '../../../../styles/variables' as v;
      .footer {
        background-color: transparent;
        color: var(--text-color);
        padding: v.$spacing-lg 0;
        margin-top: auto;

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 v.$spacing-md;
          gap: v.$spacing-md;

          p {
            text-align: center;
          }

          @media (max-width: 768px) {
            flex-direction: column;
            text-align: center;
          }
        }
      }
    `,
  ],
})
export class FooterComponent {
  public readonly themeService = inject(ThemeService);

  currentYear = new Date().getFullYear();

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
