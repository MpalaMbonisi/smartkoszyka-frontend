import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header-component';
import { signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth/auth-service';
import { ThemeService } from '../../../core/services/theme/theme.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  const mockUser = {
    email: 'nicolesmith@example.com',
    firstName: 'Nicole',
    lastName: 'Smith',
  };

  beforeEach(async () => {
    const isDarkModeSignal = signal(false);
    const themeServiceSpy = jasmine.createSpyObj<ThemeService>('ThemeService', ['toggleTheme']);
    Object.assign(themeServiceSpy, { isDarkMode: isDarkModeSignal });

    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser$: of(mockUser),
    });

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: ThemeService, useValue: themeServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Logo Display', () => {
    it('should display SmartKoszyka logo', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const logo = compiled.querySelector('.logo');

      expect(logo?.textContent).toContain('Smart');
      expect(logo?.textContent).toContain('Koszyka');
    });

    it('should have logo-smart and logo-koszyka spans', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const logoSmart = compiled.querySelector('.logo-smart');
      const logoKoszyka = compiled.querySelector('.logo-koszyka');

      expect(logoSmart).toBeTruthy();
      expect(logoKoszyka).toBeTruthy();
    });
  });

  describe('Menu Button', () => {
    it('should display menu button', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const menuBtn = compiled.querySelector('.btn-menu');

      expect(menuBtn).toBeTruthy();
    });

    it('should toggle menu when button clicked', () => {
      expect(component.showMenu()).toBe(false);

      const compiled = fixture.nativeElement as HTMLElement;
      const menuBtn = compiled.querySelector('.btn-menu') as HTMLButtonElement;
      menuBtn.click();

      expect(component.showMenu()).toBe(true);
    });

    it('should show settings panel when menu is open', () => {
      component.showMenu.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const settingsPanel = compiled.querySelector('.settings-panel');

      expect(settingsPanel).toBeTruthy();
    });

    it('should hide settings panel when menu is closed', () => {
      component.showMenu.set(false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const settingsPanel = compiled.querySelector('.settings-panel');

      expect(settingsPanel).toBeFalsy();
    });
  });
});
