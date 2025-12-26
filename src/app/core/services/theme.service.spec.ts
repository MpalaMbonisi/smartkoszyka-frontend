import { TestBed } from '@angular/core/testing';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let localStorageSpy: jasmine.SpyObj<Storage>;

  // Helper to create a type-safe MediaQueryList mock
  const createMockMediaQueryList = (matches: boolean): MediaQueryList =>
    ({
      matches,
      media: '',
      onchange: null,
      addListener: jasmine.createSpy(),
      removeListener: jasmine.createSpy(),
      addEventListener: jasmine.createSpy(),
      removeEventListener: jasmine.createSpy(),
      dispatchEvent: jasmine.createSpy(),
    }) as unknown as MediaQueryList;

  beforeEach(() => {
    // Create a spy object for localStorage
    localStorageSpy = jasmine.createSpyObj('localStorage', ['getItem', 'setItem', 'removeItem']);

    // Replace global localStorage with our spy
    Object.defineProperty(window, 'localStorage', {
      value: localStorageSpy,
      writable: true,
    });

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jasmine.createSpy('matchMedia').and.returnValue(createMockMediaQueryList(false)),
    });

    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialization', () => {
    it('should load theme from localStorage if available', () => {
      localStorageSpy.getItem.and.returnValue('dark');
      service = new ThemeService();

      expect(service.isDarkMode()).toBe(true);
      expect(document.body.getAttribute('data-theme')).toBe('dark');
    });

    it('should use system preference if no saved theme exists', () => {
      localStorageSpy.getItem.and.returnValue(null);

      // Use the helper instead of the long 'as any' block
      (window.matchMedia as jasmine.Spy).and.returnValue(createMockMediaQueryList(true));

      service = new ThemeService();
      expect(service.isDarkMode()).toBe(true);
    });

    it('should default to light mode if no preference', () => {
      localStorageSpy.getItem.and.returnValue(null);
      (window.matchMedia as jasmine.Spy).and.returnValue(createMockMediaQueryList(false));

      service = new ThemeService();

      expect(service.isDarkMode()).toBe(false);
      expect(document.body.getAttribute('data-theme')).toBe('light');
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      localStorageSpy.getItem.and.returnValue('light');
      service = new ThemeService();

      service.toggleTheme();

      expect(service.isDarkMode()).toBe(true);
      expect(document.body.getAttribute('data-theme')).toBe('dark');
      expect(localStorageSpy.setItem).toHaveBeenCalledWith('app-theme', 'dark');
    });

    it('should toggle from dark to light', () => {
      localStorageSpy.getItem.and.returnValue('dark');
      service = new ThemeService();

      service.toggleTheme();

      expect(service.isDarkMode()).toBe(false);
      expect(document.body.getAttribute('data-theme')).toBe('light');
      expect(localStorageSpy.setItem).toHaveBeenCalledWith('app-theme', 'light');
    });

    it('should update body attribute when toggling', () => {
      service.toggleTheme();
      const theme = service.isDarkMode() ? 'dark' : 'light';

      expect(document.body.getAttribute('data-theme')).toBe(theme);
    });
  });

  describe('persistence', () => {
    it('should save theme preference to localStorage', () => {
      service.toggleTheme();

      expect(localStorageSpy.setItem).toHaveBeenCalledWith(
        'app-theme',
        service.isDarkMode() ? 'dark' : 'light'
      );
    });

    it('should persist theme across service instances', () => {
      localStorageSpy.getItem.and.returnValue('dark');
      const newService = new ThemeService();

      expect(newService.isDarkMode()).toBe(true);
    });
  });
});
