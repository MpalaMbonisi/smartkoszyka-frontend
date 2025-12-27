import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
    }).compileComponents();

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
    });

    it('should submit when form is valid', fakeAsync(() => {
      component.loginForm.patchValue({
        email: 'nicolesmith@example.com',
        password: 'StrongPassword1234',
      });

      component.onSubmit();

      expect(component.isLoading).toBeTruthy();
      expect(component.errorMessage).toBe('');

      tick(1500);

      expect(component.isLoading).toBeFalsy();
    }));

    it('should mark all fields as touched on invalid submission', () => {
      component.onSubmit();

      expect(component.loginForm.get('email')?.touched).toBeTruthy();
      expect(component.loginForm.get('password')?.touched).toBeTruthy();
    });

    it('should set loading state during submission', () => {
      component.loginForm.patchValue({
        email: 'nicolesmith@example.com',
        password: 'StrongPassword1234',
      });

      component.onSubmit();

      expect(component.isLoading).toBeTruthy();
    });

    it('should clear error message on new submission', () => {
      component.errorMessage = 'Previous error';
      component.loginForm.patchValue({
        email: 'nicolesmith@example.com',
        password: 'StrongPassword1234',
      });

      component.onSubmit();

      expect(component.errorMessage).toBe('');
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
      const passwordInput = compiled.querySelector('#password') as HTMLInputElement;

      expect(passwordInput).toBeTruthy();
      expect(passwordInput.type).toBe('password');
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
});
