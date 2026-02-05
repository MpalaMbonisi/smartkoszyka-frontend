import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth-service';
import { AccountService } from '../../../core/services/account/account-service';
import { take } from 'rxjs';

@Component({
  selector: 'app-header-component',
  imports: [CommonModule],
  templateUrl: './header-component.html',
  styleUrl: './header-component.scss',
})
export class HeaderComponent implements OnInit {
  private authService = inject(AuthService);
  private accountService = inject(AccountService);

  user$ = this.authService.currentUser$;
  showMenu = signal(false);
  showAccountInfo = signal(false);
  selectedTheme = signal<'auto' | 'light' | 'dark'>('auto');

  constructor() {
    effect(() => {
      if (this.showMenu()) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }

  ngOnInit(): void {
    this.loadThemePreference();
  }

  toggleMenu(): void {
    this.showMenu.update(value => !value);
    if (this.showMenu()) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  }

  closeMenu(): void {
    this.showMenu.set(false);
    document.body.classList.remove('menu-open');
  }

  onThemeChange(theme: 'auto' | 'light' | 'dark'): void {
    this.selectedTheme.set(theme);
    localStorage.setItem('theme-preference', theme);
    this.applyTheme(theme);
  }

  onLogout(): void {
    this.authService.logout();
    this.closeMenu();
  }

  onViewAccount(): void {
    this.showAccountInfo.set(true);
    this.closeMenu();
  }

  onCloseAccountModal(): void {
    this.showAccountInfo.set(false);
  }

  onDeleteAccount(): void {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );

    if (confirmed) {
      // We subscribe once to get the current email from the user$ observable
      this.user$.pipe(take(1)).subscribe(user => {
        if (user?.email) {
          this.accountService.deleteAccount(user.email).subscribe({
            next: () => {
              this.authService.logout();
              this.closeMenu();
              alert('Your account has been permanently deleted.');
            },
            error: err => {
              console.error('Delete account failed:', err);
              alert('Failed to delete account. Please try again later.');
            },
          });
        }
      });
    }
  }

  private loadThemePreference(): void {
    const savedTheme = localStorage.getItem('theme-preference') as 'auto' | 'light' | 'dark' | null;
    if (savedTheme) {
      this.selectedTheme.set(savedTheme);
      this.applyTheme(savedTheme);
    } else {
      this.applyTheme('auto');
    }
  }

  private applyTheme(theme: 'auto' | 'light' | 'dark'): void {
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.body.setAttribute('data-theme', theme);
    }
  }
}
