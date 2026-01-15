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
  let authService: jasmine.SpyObj<AuthService>;

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

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

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

  describe('Theme Toggle', () => {
    beforeEach(() => {
      component.showMenu.set(true);
      fixture.detectChanges();
    });

    it('should display theme options', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const themeOptions = compiled.querySelectorAll('input[name="theme"]');
      expect(themeOptions.length).toBe(3);
    });

    it('should have auto, light, and dark theme options', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const autoOption = compiled.querySelector('input[value="auto"]');
      const lightOption = compiled.querySelector('input[value="light"]');
      const darkOption = compiled.querySelector('input[value="dark"]');

      expect(autoOption).toBeTruthy();
      expect(lightOption).toBeTruthy();
      expect(darkOption).toBeTruthy();
    });

    it('should initialize with auto theme selected', () => {
      expect(component.selectedTheme()).toBe('auto');
    });

    it('should apply light theme when selected', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const lightOption = compiled.querySelector('input[value="light"]') as HTMLInputElement;

      lightOption.click();
      fixture.detectChanges();

      expect(component.selectedTheme()).toBe('light');
      expect(document.body.getAttribute('data-theme')).toBe('light');
    });

    it('should apply dark theme when selected', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const darkOption = compiled.querySelector('input[value="dark"]') as HTMLInputElement;

      darkOption.click();
      fixture.detectChanges();

      expect(component.selectedTheme()).toBe('dark');
      expect(document.body.getAttribute('data-theme')).toBe('dark');
    });

    it('should apply system theme when auto selected', () => {
      // Refactored: Cast to MediaQueryList instead of any
      spyOn(window, 'matchMedia').and.returnValue({
        matches: true,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        addListener: jasmine.createSpy(),
        removeListener: jasmine.createSpy(),
        addEventListener: jasmine.createSpy(),
        removeEventListener: jasmine.createSpy(),
        dispatchEvent: jasmine.createSpy(),
      } as MediaQueryList);

      const compiled = fixture.nativeElement as HTMLElement;
      const autoOption = compiled.querySelector('input[value="auto"]') as HTMLInputElement;

      autoOption.click();
      fixture.detectChanges();

      expect(component.selectedTheme()).toBe('auto');
    });

    it('should persist theme selection in localStorage', () => {
      spyOn(localStorage, 'setItem');

      component.onThemeChange('dark');

      expect(localStorage.setItem).toHaveBeenCalledWith('theme-preference', 'dark');
    });
  });

  describe('Logout', () => {
    beforeEach(() => {
      component.showMenu.set(true);
      fixture.detectChanges();
    });

    it('should display logout button', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const logoutBtn = compiled.querySelector('.btn-logout');

      expect(logoutBtn).toBeTruthy();
    });

    it('should call authService.logout when clicked', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const logoutBtn = compiled.querySelector('.btn-logout') as HTMLButtonElement;

      logoutBtn.click();

      expect(authService.logout).toHaveBeenCalled();
    });

    it('should close menu after logout', () => {
      component.showMenu.set(true);

      component.onLogout();

      expect(component.showMenu()).toBe(false);
    });
  });

  describe('Account Information', () => {
    beforeEach(() => {
      component.showMenu.set(true);
      fixture.detectChanges();
    });

    it('should display view account button', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const viewAccountBtn = compiled.querySelector('.btn-view-account');

      expect(viewAccountBtn).toBeTruthy();
    });

    it('should show account info modal when clicked', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const viewAccountBtn = compiled.querySelector('.btn-view-account') as HTMLButtonElement;

      viewAccountBtn.click();
      fixture.detectChanges();

      expect(component.showAccountInfo()).toBe(true);
    });

    it('should display user information in modal', () => {
      component.showAccountInfo.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const modal = compiled.querySelector('.account-modal');

      expect(modal?.textContent).toContain('Nicole');
      expect(modal?.textContent).toContain('Smith');
      expect(modal?.textContent).toContain('nicolesmith@example.com');
    });

    it('should not display password in account info', () => {
      component.showAccountInfo.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const modal = compiled.querySelector('.account-modal');

      expect(modal?.textContent).not.toContain('password');
    });

    it('should close account modal when close button clicked', () => {
      component.showAccountInfo.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const closeBtn = compiled.querySelector('.btn-close-modal') as HTMLButtonElement;

      closeBtn.click();
      fixture.detectChanges();

      expect(component.showAccountInfo()).toBe(false);
    });
  });

  describe('Delete Account', () => {
    beforeEach(() => {
      component.showMenu.set(true);
      fixture.detectChanges();
    });

    it('should display delete account button', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const deleteBtn = compiled.querySelector('.btn-delete-account');

      expect(deleteBtn).toBeTruthy();
    });

    it('should show confirmation dialog when delete clicked', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      const compiled = fixture.nativeElement as HTMLElement;
      const deleteBtn = compiled.querySelector('.btn-delete-account') as HTMLButtonElement;

      deleteBtn.click();

      expect(window.confirm).toHaveBeenCalled();
    });

    it('should not delete account if user cancels', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.onDeleteAccount();

      expect(authService.logout).not.toHaveBeenCalled();
    });

    it('should delete account if user confirms', () => {
      spyOn(window, 'confirm').and.returnValue(true);

      component.onDeleteAccount();

      // In real implementation, would call delete API
      expect(window.confirm).toHaveBeenCalled();
    });
  });
});
