import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { provideRouter, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { of, Subject, throwError } from 'rxjs';
import { AuthResponse, AuthService } from '../../../../core/services/auth/auth-service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;
  let authService: jasmine.SpyObj<AuthService>;

  const mockAuthResponse = {
    token: 'fake-jwt-token',
    email: 'nicolesmith@example.com',
    firstName: 'Nicole',
    lastName: 'Smith',
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, FooterComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceSpy }],
    }).compileComponents();

    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize with empty form', () => {
      expect(component.loginForm.value).toEqual({
        email: '',
        password: '',
      });
    });

    it('should have form controls', () => {
      expect(component.loginForm.get('email')).toBeTruthy();
      expect(component.loginForm.get('password')).toBeTruthy();
    });

    it('should mark form as invalid initially', () => {
      expect(component.loginForm.valid).toBeFalsy();
    });
  });

  describe('Email Validation', () => {
    it('should be invalid when empty', () => {
      const email = component.loginForm.get('email');
      expect(email?.valid).toBeFalsy();
      expect(email?.hasError('required')).toBeTruthy();
    });

    it('should be invalid with invalid email format', () => {
      const email = component.loginForm.get('email');
      email?.setValue('invalid-email');

      expect(email?.valid).toBeFalsy();
      expect(email?.hasError('email')).toBeTruthy();
    });

    it('should be valid with correct email format', () => {
      const email = component.loginForm.get('email');
      email?.setValue('nicolesmith@example.com');

      expect(email?.valid).toBeTruthy();
    });

    it('should show error message for invalid email', () => {
      const email = component.loginForm.get('email');
      email?.setValue('invalid');
      email?.markAsTouched();
      fixture.detectChanges();

      expect(component.isFieldInvalid('email')).toBeTruthy();
      expect(component.getErrorMessage('email')).toBe('Please enter a valid email address');
    });

    it('should show required error message', () => {
      const email = component.loginForm.get('email');
      email?.markAsTouched();
      fixture.detectChanges();

      expect(component.getErrorMessage('email')).toBe('Email is required');
    });
  });

  describe('Password Validation', () => {
    it('should be invalid when empty', () => {
      const password = component.loginForm.get('password');
      expect(password?.valid).toBeFalsy();
      expect(password?.hasError('required')).toBeTruthy();
    });

    it('should be invalid when less than 8 characters', () => {
      const password = component.loginForm.get('password');
      password?.setValue('short');

      expect(password?.valid).toBeFalsy();
      expect(password?.hasError('minlength')).toBeTruthy();
    });

    it('should be valid with 8 or more characters', () => {
      const password = component.loginForm.get('password');
      password?.setValue('StrongPassword1234');

      expect(password?.valid).toBeTruthy();
    });

    it('should show minlength error message', () => {
      const password = component.loginForm.get('password');
      password?.setValue('short');
      password?.markAsTouched();

      expect(component.getErrorMessage('password')).toBe('Password must be at least 8 characters');
    });
  });

  describe('Form Submission', () => {
    it('should not submit when form is invalid', () => {
      component.onSubmit();

      expect(component.loginForm.touched).toBeTruthy();
      expect(component.isLoading).toBeFalsy();
      expect(authService.login).not.toHaveBeenCalled();
    });

    it('should call authService.login with form values', () => {
      authService.login.and.returnValue(of(mockAuthResponse));

      component.loginForm.patchValue({
        email: 'nicolesmith@example.com',
        password: 'StrongPassword1234',
      });

      component.onSubmit();

      expect(authService.login).toHaveBeenCalledWith({
        email: 'nicolesmith@example.com',
        password: 'StrongPassword1234',
      });
    });

    it('should navigate to dashboard on successful login', fakeAsync(() => {
      authService.login.and.returnValue(of(mockAuthResponse));

      component.loginForm.patchValue({
        email: 'nicolesmith@example.com',
        password: 'StrongPassword1234',
      });

      component.onSubmit();
      tick();

      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
      expect(component.isLoading).toBeFalsy();
    }));

    it('should set loading state during submission', () => {
      const registerSubject = new Subject<AuthResponse>();
      authService.login.and.returnValue(registerSubject.asObservable());

      component.loginForm.patchValue({
        email: 'nicolesmith@example.com',
        password: 'StrongPassword1234',
      });

      component.onSubmit();

      expect(component.isLoading).toBeTruthy();
    });

    it('should clear error message on new submission', () => {
      authService.login.and.returnValue(of(mockAuthResponse));

      component.errorMessage = 'Previous error';
      component.loginForm.patchValue({
        email: 'nicolesmith@example.com',
        password: 'StrongPassword1234',
      });

      component.onSubmit();

      expect(component.errorMessage).toBe('');
    });

    it('should handle login error', fakeAsync(() => {
      const error = new Error('Invalid credentials');
      authService.login.and.returnValue(throwError(() => error));

      component.loginForm.patchValue({
        email: 'nicolesmith@example.com',
        password: 'WrongPassword',
      });

      component.onSubmit();
      tick();

      expect(component.isLoading).toBeFalsy();
      expect(component.errorMessage).toBe('Invalid credentials');
      expect(router.navigate).not.toHaveBeenCalled();
    }));

    it('should show default error message when error has no message', fakeAsync(() => {
      authService.login.and.returnValue(throwError(() => new Error()));

      component.loginForm.patchValue({
        email: 'nicolesmith@example.com',
        password: 'WrongPassword',
      });

      component.onSubmit();
      tick();

      expect(component.errorMessage).toBe('Login failed. Please try again.');
    }));

    it('should mark all fields as touched on invalid submission', () => {
      component.onSubmit();

      expect(component.loginForm.get('email')?.touched).toBeTruthy();
      expect(component.loginForm.get('password')?.touched).toBeTruthy();
    });
  });

  describe('UI Rendering', () => {
    it('should display logo with correct text', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const logo = compiled.querySelector('.logo');

      expect(logo?.textContent).toContain('Smart');
      expect(logo?.textContent).toContain('Koszyka');
    });

    it('should display welcome text', () => {
      const compiled = fixture.nativeElement as HTMLElement;

      expect(compiled.textContent).toContain('Welcome Back');
      expect(compiled.textContent).toContain('Sign in to your account to continue');
    });

    it('should have email input field', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const emailInput = compiled.querySelector('#email') as HTMLInputElement;

      expect(emailInput).toBeTruthy();
      expect(emailInput.type).toBe('email');
    });

    it('should have password input field', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const passwordInput = compiled.querySelector('app-password-input-component');

      expect(passwordInput).toBeTruthy();
    });

    it('should have submit button', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const submitButton = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;

      expect(submitButton).toBeTruthy();
      expect(submitButton.textContent).toContain('Sign In');
    });

    it('should display link to register page', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const registerLink = compiled.querySelector('a[routerLink="/register"]');

      expect(registerLink).toBeTruthy();
      expect(registerLink?.textContent).toContain('Sign up here');
    });

    it('should display error message when present', () => {
      component.errorMessage = 'Invalid credentials';
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const errorAlert = compiled.querySelector('.alert-error');

      expect(errorAlert?.textContent).toContain('Invalid credentials');
    });

    it('should show loading text when submitting', () => {
      component.isLoading = true;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const submitButton = compiled.querySelector('button[type="submit"]');

      expect(submitButton?.textContent).toContain('Signing In...');
    });

    it('should disable button when loading', () => {
      component.isLoading = true;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const submitButton = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;

      expect(submitButton.disabled).toBeTruthy();
    });

    it('should show validation errors in UI', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const email = component.loginForm.get('email');

      email?.setValue('invalid');
      email?.markAsTouched();
      fixture.detectChanges();

      const errorSpan = compiled.querySelector('.form-group .error');
      expect(errorSpan?.textContent).toBeTruthy();
    });

    it('should apply loading class to card when submitting', () => {
      component.isLoading = true;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const authCard = compiled.querySelector('.auth-card');

      expect(authCard?.classList.contains('loading')).toBeTruthy();
    });
  });

  describe('Helper Methods', () => {
    it('should return correct field validity status', () => {
      const email = component.loginForm.get('email');

      expect(component.isFieldInvalid('email')).toBeFalsy();

      email?.markAsTouched();
      expect(component.isFieldInvalid('email')).toBeTruthy();
    });

    it('should return empty string for valid field', () => {
      const email = component.loginForm.get('email');
      email?.setValue('nicolesmith@example.com');

      expect(component.getErrorMessage('email')).toBe('');
    });

    it('should handle non-existent field gracefully', () => {
      expect(component.isFieldInvalid('nonexistent')).toBeFalsy();
      expect(component.getErrorMessage('nonexistent')).toBe('');
    });
  });

  describe('Footer Integration', () => {
    it('should render footer component', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const footer = compiled.querySelector('app-footer');

      expect(footer).toBeTruthy();
    });
  });
});
