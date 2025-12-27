import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  isDarkMode = signal<boolean>(false);

  constructor() {
    this.loadTheme();
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const isDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    this.setTheme(isDark);
  }

  toggleTheme(): void {
    this.setTheme(!this.isDarkMode());
  }

  private setTheme(isDark: boolean): void {
    this.isDarkMode.set(isDark);
    const theme = isDark ? 'dark' : 'light';
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }
}
