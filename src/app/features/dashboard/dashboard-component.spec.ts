import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard-component';
import { BehaviorSubject } from 'rxjs';
import { AuthService, User } from '../../core/services/auth/auth-service';
import { Router } from '@angular/router';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  // let authService: jasmine.SpyObj<AuthService>;
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
});
