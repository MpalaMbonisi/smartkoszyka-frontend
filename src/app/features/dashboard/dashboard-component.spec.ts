import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard-component';
import { BehaviorSubject } from 'rxjs';
import { AuthService, User } from '../../core/services/auth/auth-service';
import { Router } from '@angular/router';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  // let router: jasmine.SpyObj<Router>;
  let currentUserSubject: BehaviorSubject<User | null>;

  const mockUser = {
    email: 'nicolesmith@example.com',
    firstName: 'Nicole',
    lastName: 'Smith',
  };

  beforeEach(async () => {
    currentUserSubject = new BehaviorSubject<User | null>(mockUser);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      currentUser$: currentUserSubject.asObservable(),
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('User Display', () => {
    it('should display user name in header', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const userName = compiled.querySelector('.user-name');

      expect(userName?.textContent).toContain('Nicole Smith');
    });

    it('should display user first name in welcome message', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const welcomeCard = compiled.querySelector('.welcome-card h2');

      expect(welcomeCard?.textContent).toContain('Hello, Nicole!');
    });

    it('should update display when user changes', () => {
      const newUser = {
        email: 'mbonisimpala@example.com',
        firstName: 'Mbonisi',
        lastName: 'Mpala',
      };

      currentUserSubject.next(newUser);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const userName = compiled.querySelector('.user-name');

      expect(userName?.textContent).toContain('Mbonisi Mpala');
    });

    it('should handle user with long names', () => {
      const longNameUser = {
        email: 'verylongemail@example.com',
        firstName: 'VeryLongFirstName',
        lastName: 'VeryLongLastName',
      };

      currentUserSubject.next(longNameUser);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const userName = compiled.querySelector('.user-name');

      expect(userName?.textContent).toContain('VeryLongFirstName VeryLongLastName');
    });
  });

  describe('Logo Display', () => {
    it('should display SmartKoszyka logo', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const logo = compiled.querySelector('.logo');

      expect(logo?.textContent).toContain('Smart');
      expect(logo?.textContent).toContain('Koszyka');
    });

    it('should have separate spans for logo parts', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const logoSmart = compiled.querySelector('.logo-smart');
      const logoKoszyka = compiled.querySelector('.logo-koszyka');

      expect(logoSmart?.textContent).toBe('Smart');
      expect(logoKoszyka?.textContent).toBe('Koszyka');
    });
  });

  describe('Logout Functionality', () => {
    it('should call authService.logout when logout button clicked', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const logoutButton = compiled.querySelector('.btn-logout') as HTMLButtonElement;

      logoutButton.click();

      expect(authService.logout).toHaveBeenCalled();
    });

    it('should have logout button in user menu', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const logoutButton = compiled.querySelector('.btn-logout');

      expect(logoutButton).toBeTruthy();
      expect(logoutButton?.textContent?.trim()).toBe('Logout');
    });

    it('should call logout only once per click', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const logoutButton = compiled.querySelector('.btn-logout') as HTMLButtonElement;

      logoutButton.click();

      expect(authService.logout).toHaveBeenCalledTimes(1);
    });
  });

  describe('Dashboard Content', () => {
    it('should display dashboard title', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const title = compiled.querySelector('h1');

      expect(title?.textContent).toContain('Dashboard');
    });

    it('should display welcome message', () => {
      const compiled = fixture.nativeElement as HTMLElement;

      expect(compiled.textContent).toContain('Welcome to SmartKoszyka!');
    });

    it('should display coming soon section', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const comingSoon = compiled.querySelector('.coming-soon');

      expect(comingSoon).toBeTruthy();
    });

    it('should list coming soon features', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const features = compiled.querySelectorAll('.coming-soon li');

      expect(features.length).toBeGreaterThan(0);
      expect(features[0].textContent).toContain('Shopping Lists');
    });
  });

  describe('Responsive Layout', () => {
    it('should have dashboard-header element', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const header = compiled.querySelector('.dashboard-header');

      expect(header).toBeTruthy();
    });

    it('should have dashboard-content element', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const content = compiled.querySelector('.dashboard-content');

      expect(content).toBeTruthy();
    });

    it('should have container for content', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const container = compiled.querySelector('.container');

      expect(container).toBeTruthy();
    });

    it('should have welcome card', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const welcomeCard = compiled.querySelector('.welcome-card');

      expect(welcomeCard).toBeTruthy();
    });
  });

  describe('Component Integration', () => {
    it('should have user$ observable', done => {
      component.user$.subscribe(user => {
        expect(user).toEqual(mockUser);
        done();
      });
    });

    it('should call onLogout method', () => {
      spyOn(component, 'onLogout');
      const compiled = fixture.nativeElement as HTMLElement;
      const logoutButton = compiled.querySelector('.btn-logout') as HTMLButtonElement;

      logoutButton.click();

      expect(component.onLogout).toHaveBeenCalled();
    });
  });

  describe('Null User Handling', () => {
    it('should handle null user gracefully', () => {
      currentUserSubject.next(null);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const userMenu = compiled.querySelector('.user-menu');

      expect(userMenu).toBeFalsy();
    });

    it('should not display welcome card when user is null', () => {
      currentUserSubject.next(null);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const welcomeCard = compiled.querySelector('.welcome-card');

      expect(welcomeCard).toBeFalsy();
    });
  });

  describe('Header Structure', () => {
    it('should have header-content wrapper', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const headerContent = compiled.querySelector('.header-content');

      expect(headerContent).toBeTruthy();
    });

    it('should have user-menu section', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const userMenu = compiled.querySelector('.user-menu');

      expect(userMenu).toBeTruthy();
    });

    it('should display logo and user menu in same header', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const header = compiled.querySelector('.dashboard-header');
      const logo = header?.querySelector('.logo');
      const userMenu = header?.querySelector('.user-menu');

      expect(logo).toBeTruthy();
      expect(userMenu).toBeTruthy();
    });
  });
});
