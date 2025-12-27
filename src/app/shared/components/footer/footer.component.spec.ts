import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterComponent } from './footer.component';
import { signal, WritableSignal } from '@angular/core';
import { ThemeService } from '../../../core/services/theme/theme.service';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;
  let themeService: jasmine.SpyObj<ThemeService> & { isDarkMode: WritableSignal<boolean> };

  beforeEach(async () => {
    const isDarkModeSignal = signal(false);
    const themeServiceSpy = jasmine.createSpyObj<ThemeService>('ThemeService', ['toggleTheme']);

    Object.assign(themeServiceSpy, { isDarkMode: isDarkModeSignal });

    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [{ provide: ThemeService, useValue: themeServiceSpy }],
    }).compileComponents();

    themeService = TestBed.inject(ThemeService) as jasmine.SpyObj<ThemeService> & {
      isDarkMode: WritableSignal<boolean>;
    };

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display current year', () => {
    const currentYear = new Date().getFullYear();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain(currentYear.toString());
  });

  it('should display copyright text', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('SmartKoszyka');
    expect(compiled.textContent).toContain('All rights reserved');
  });

  describe('theme toggle button', () => {
    it('should display light mode button when in dark mode', () => {
      themeService.isDarkMode.set(true);

      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.theme-toggle')?.textContent).toContain('Light Mode');
    });

    it('should display dark mode button when in light mode', () => {
      themeService.isDarkMode.set(false);

      fixture.detectChanges();
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.theme-toggle')?.textContent).toContain('Dark Mode');
    });

    it('should call toggleTheme when button is clicked', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const button = compiled.querySelector('.theme-toggle') as HTMLButtonElement;

      button.click();

      expect(themeService.toggleTheme).toHaveBeenCalled();
    });

    it('should have proper accessibility attributes', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const button = compiled.querySelector('.theme-toggle') as HTMLButtonElement;

      expect(button.getAttribute('aria-label')).toBe('Toggle theme');
    });
  });

  describe('responsive layout', () => {
    it('should have footer-content container', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const footerContent = compiled.querySelector('.footer-content');

      expect(footerContent).toBeTruthy();
    });

    it('should have left and right sections', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const footerLeft = compiled.querySelector('.footer-left');
      const footerRight = compiled.querySelector('.footer-right');

      expect(footerLeft).toBeTruthy();
      expect(footerRight).toBeTruthy();
    });
  });
});
