import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { provideRouter, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { AuthResponse, AuthService } from '../../../../core/services/auth/auth-service';
import { of, Subject, throwError } from 'rxjs';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let router: Router;
  let authService: jasmine.SpyObj<AuthService>;

  const mockAuthResponse = {
    token: 'fake-jwt-token',
    email: 'nicolesmith@example.com',
    firstName: 'Nicole',
    lastName: 'Smith',
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule, FooterComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceSpy }],
    }).compileComponents();

    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize with empty form', () => {
      expect(component.registerForm.value).toEqual({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
    });

    it('should have all form controls', () => {
      expect(component.registerForm.get('firstName')).toBeTruthy();
      expect(component.registerForm.get('lastName')).toBeTruthy();
      expect(component.registerForm.get('email')).toBeTruthy();
      expect(component.registerForm.get('password')).toBeTruthy();
      expect(component.registerForm.get('confirmPassword')).toBeTruthy();
    });

    it('should mark form as invalid initially', () => {
      expect(component.registerForm.valid).toBeFalsy();
    });
  });

  describe('First Name Validation', () => {
    it('should be invalid when empty', () => {
      const firstName = component.registerForm.get('firstName');
      expect(firstName?.valid).toBeFalsy();
      expect(firstName?.hasError('required')).toBeTruthy();
    });

    it('should be invalid with less than 2 characters', () => {
      const firstName = component.registerForm.get('firstName');
      firstName?.setValue('A');

      expect(firstName?.valid).toBeFalsy();
      expect(firstName?.hasError('minlength')).toBeTruthy();
    });

    it('should be valid with 2 or more characters', () => {
      const firstName = component.registerForm.get('firstName');
      firstName?.setValue('Nicole');

      expect(firstName?.valid).toBeTruthy();
    });

    it('should show required error message', () => {
      const firstName = component.registerForm.get('firstName');
      firstName?.markAsTouched();

      expect(component.getErrorMessage('firstName')).toBe('First Name is required');
    });

    it('should show minlength error message', () => {
      const firstName = component.registerForm.get('firstName');
      firstName?.setValue('A');
      firstName?.markAsTouched();

      expect(component.getErrorMessage('firstName')).toBe('Must be at least 2 characters');
    });
  });

  describe('Last Name Validation', () => {
    it('should be invalid when empty', () => {
      const lastName = component.registerForm.get('lastName');
      expect(lastName?.valid).toBeFalsy();
      expect(lastName?.hasError('required')).toBeTruthy();
    });

    it('should be invalid with less than 2 characters', () => {
      const lastName = component.registerForm.get('lastName');
      lastName?.setValue('S');

      expect(lastName?.valid).toBeFalsy();
      expect(lastName?.hasError('minlength')).toBeTruthy();
    });

    it('should be valid with 2 or more characters', () => {
      const lastName = component.registerForm.get('lastName');
      lastName?.setValue('Smith');

      expect(lastName?.valid).toBeTruthy();
    });
  });

  describe('Email Validation', () => {
    it('should be invalid when empty', () => {
      const email = component.registerForm.get('email');
      expect(email?.valid).toBeFalsy();
    });

    it('should be invalid with invalid email format', () => {
      const email = component.registerForm.get('email');
      email?.setValue('invalid-email');

      expect(email?.valid).toBeFalsy();
      expect(email?.hasError('email')).toBeTruthy();
    });

    it('should be valid with correct email format', () => {
      const email = component.registerForm.get('email');
      email?.setValue('nicolesmith@example.com');

      expect(email?.valid).toBeTruthy();
    });
  });

  describe('Password Validation', () => {
    it('should be invalid when empty', () => {
      const password = component.registerForm.get('password');
      expect(password?.valid).toBeFalsy();
    });

    it('should be invalid when less than 8 characters', () => {
      const password = component.registerForm.get('password');
      password?.setValue('short');

      expect(password?.valid).toBeFalsy();
      expect(password?.hasError('minlength')).toBeTruthy();
    });

    it('should be valid with 8 or more characters', () => {
      const password = component.registerForm.get('password');
      password?.setValue('StrongStrongPassword12344');

      expect(password?.valid).toBeTruthy();
    });
  });

  describe('Password Confirmation Validation', () => {
    it('should be invalid when passwords do not match', () => {
      component.registerForm.patchValue({
        password: 'StrongStrongPassword12344',
        confirmPassword: 'StrongPassword5678',
      });

      const confirmPassword = component.registerForm.get('confirmPassword');
      expect(confirmPassword?.hasError('passwordMismatch')).toBeTruthy();
    });

    it('should be valid when passwords match', () => {
      component.registerForm.patchValue({
        password: 'StrongStrongPassword12344',
        confirmPassword: 'StrongStrongPassword12344',
      });

      const confirmPassword = component.registerForm.get('confirmPassword');
      expect(confirmPassword?.hasError('passwordMismatch')).toBeFalsy();
    });

    it('should show password mismatch error message', () => {
      component.registerForm.patchValue({
        password: 'StrongStrongPassword12344',
        confirmPassword: 'StrongPassword5678',
      });
      component.registerForm.get('confirmPassword')?.markAsTouched();

      expect(component.getErrorMessage('confirmPassword')).toBe('Passwords do not match');
    });

    it('should clear mismatch error when passwords match', () => {
      component.registerForm.patchValue({
        password: 'StrongStrongPassword12344',
        confirmPassword: 'StrongPassword5678',
      });

      let confirmPassword = component.registerForm.get('confirmPassword');
      expect(confirmPassword?.hasError('passwordMismatch')).toBeTruthy();

      component.registerForm.patchValue({
        confirmPassword: 'StrongStrongPassword12344',
      });

      confirmPassword = component.registerForm.get('confirmPassword');
      expect(confirmPassword?.hasError('passwordMismatch')).toBeFalsy();
    });
  });

  describe('Form Submission', () => {
    it('should not submit when form is invalid', () => {
      component.onSubmit();

      expect(component.registerForm.touched).toBeTruthy();
      expect(component.isLoading).toBeFalsy();
      expect(authService.register).not.toHaveBeenCalled();
    });

    it('should call authService.register with form values', () => {
      authService.register.and.returnValue(of(mockAuthResponse));

      component.registerForm.patchValue({
        firstName: 'Nicole',
        lastName: 'Smith',
        email: 'nicolesmith@example.com',
        password: 'StrongPassword1234',
        confirmPassword: 'StrongPassword1234',
      });

      component.onSubmit();

      expect(authService.register).toHaveBeenCalledWith({
        firstName: 'Nicole',
        lastName: 'Smith',
        email: 'nicolesmith@example.com',
        password: 'StrongPassword1234',
      });
    });

    it('should navigate to dashboard on successful registration', fakeAsync(() => {
      authService.register.and.returnValue(of(mockAuthResponse));

      component.registerForm.patchValue({
        firstName: 'Nicole',
        lastName: 'Smith',
        email: 'nicolesmith@example.com',
        password: 'StrongPassword1234',
        confirmPassword: 'StrongPassword1234',
      });

      component.onSubmit();
      tick();

      expect(component.isLoading).toBeFalsy();
      expect(component.successMessage).toContain('Account created successfully');

      tick(2000);

      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    }));

    it('should set loading state during submission', () => {
      const registerSubject = new Subject<AuthResponse>();
      authService.register.and.returnValue(registerSubject.asObservable());

      component.registerForm.patchValue({
        firstName: 'Nicole',
        lastName: 'Smith',
        email: 'nicolesmith@example.com',
        password: 'StrongPassword1234',
        confirmPassword: 'StrongPassword1234',
      });

      component.onSubmit();

      expect(component.isLoading).toBeTruthy();

      registerSubject.next(mockAuthResponse);
      registerSubject.complete();
    });

    it('should clear error and success messages on new submission', () => {
      const registerSubject = new Subject<AuthResponse>();
      authService.register.and.returnValue(registerSubject.asObservable());

      component.errorMessage = 'Previous error';
      component.successMessage = 'Previous success';

      component.registerForm.patchValue({
        firstName: 'Nicole',
        lastName: 'Smith',
        email: 'nicolesmith@example.com',
        password: 'StrongPassword1234',
        confirmPassword: 'StrongPassword1234',
      });

      component.onSubmit();

      expect(component.errorMessage).toBe('');
      expect(component.successMessage).toBe('');

      registerSubject.next(mockAuthResponse);
      registerSubject.complete();
    });

    it('should handle registration error', fakeAsync(() => {
      const error = new Error('Email already exists');
      authService.register.and.returnValue(throwError(() => error));

      component.registerForm.patchValue({
        firstName: 'Nicole',
        lastName: 'Smith',
        email: 'nicolesmith@example.com',
        password: 'StrongPassword1234',
        confirmPassword: 'StrongPassword1234',
      });

      component.onSubmit();
      tick();

      expect(component.isLoading).toBeFalsy();
      expect(component.errorMessage).toBe('Email already exists');
      expect(router.navigate).not.toHaveBeenCalled();
    }));

    it('should show default error message when error has no message', fakeAsync(() => {
      authService.register.and.returnValue(throwError(() => new Error()));

      component.registerForm.patchValue({
        firstName: 'Nicole',
        lastName: 'Smith',
        email: 'nicolesmith@example.com',
        password: 'StrongPassword1234',
        confirmPassword: 'StrongPassword1234',
      });

      component.onSubmit();
      tick();

      expect(component.errorMessage).toBe('Registration failed. Please try again.');
    }));

    it('should not include confirmPassword in submitted data', fakeAsync(() => {
      authService.register.and.returnValue(of(mockAuthResponse));

      component.registerForm.patchValue({
        firstName: 'Nicole',
        lastName: 'Smith',
        email: 'nicolesmith@example.com',
        password: 'StrongPassword1234',
        confirmPassword: 'StrongPassword1234',
      });

      component.onSubmit();
      tick();

      expect(authService.register).toHaveBeenCalledWith({
        firstName: 'Nicole',
        lastName: 'Smith',
        email: 'nicolesmith@example.com',
        password: 'StrongPassword1234',
      });
    }));

    it('should mark all fields as touched on invalid submission', () => {
      component.onSubmit();

      expect(component.registerForm.get('firstName')?.touched).toBeTruthy();
      expect(component.registerForm.get('lastName')?.touched).toBeTruthy();
      expect(component.registerForm.get('email')?.touched).toBeTruthy();
      expect(component.registerForm.get('password')?.touched).toBeTruthy();
      expect(component.registerForm.get('confirmPassword')?.touched).toBeTruthy();
    });
  });

  describe('UI Rendering', () => {
    it('should display logo with correct text', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const logo = compiled.querySelector('.logo');

      expect(logo?.textContent).toContain('Smart');
      expect(logo?.textContent).toContain('Koszyka');
    });

    it('should display registration header', () => {
      const compiled = fixture.nativeElement as HTMLElement;

      expect(compiled.textContent).toContain('Create Account');
      expect(compiled.textContent).toContain('Sign up to get started with SmartKoszyka');
    });

    it('should have all input fields', () => {
      const compiled = fixture.nativeElement as HTMLElement;

      expect(compiled.querySelector('#firstName')).toBeTruthy();
      expect(compiled.querySelector('#lastName')).toBeTruthy();
      expect(compiled.querySelector('#email')).toBeTruthy();
      expect(compiled.querySelector('#password')).toBeTruthy();
      expect(compiled.querySelector('#confirmPassword')).toBeTruthy();
    });

    it('should have submit button', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const submitButton = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;

      expect(submitButton).toBeTruthy();
      expect(submitButton.textContent).toContain('Sign Up');
    });

    it('should display link to login page', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const loginLink = compiled.querySelector('a[routerLink="/login"]');

      expect(loginLink).toBeTruthy();
      expect(loginLink?.textContent).toContain('Sign in here');
    });

    it('should display error alert when error message exists', () => {
      component.errorMessage = 'Registration failed';
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const errorAlert = compiled.querySelector('.alert-error');

      expect(errorAlert).toBeTruthy();
      expect(errorAlert?.textContent).toContain('Registration failed');
    });

    it('should display success alert when success message exists', () => {
      component.successMessage = 'Registration successful';
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const successAlert = compiled.querySelector('.alert-success');

      expect(successAlert).toBeTruthy();
      expect(successAlert?.textContent).toContain('Registration successful');
    });

    it('should show loading text when submitting', () => {
      component.isLoading = true;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const submitButton = compiled.querySelector('button[type="submit"]');

      expect(submitButton?.textContent).toContain('Creating Account...');
    });

    it('should disable button when loading', () => {
      component.isLoading = true;
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const submitButton = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;

      expect(submitButton.disabled).toBeTruthy();
    });

    it('should display form-row for name fields', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const formRow = compiled.querySelector('.form-row');

      expect(formRow).toBeTruthy();
    });

    it('should show validation errors in UI', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const firstName = component.registerForm.get('firstName');

      firstName?.setValue('A');
      firstName?.markAsTouched();
      fixture.detectChanges();

      const errorSpans = compiled.querySelectorAll('.error');
      expect(errorSpans.length).toBeGreaterThan(0);
    });
  });

  describe('Helper Methods', () => {
    it('should return correct field validity status', () => {
      const firstName = component.registerForm.get('firstName');

      expect(component.isFieldInvalid('firstName')).toBeFalsy();

      firstName?.markAsTouched();
      expect(component.isFieldInvalid('firstName')).toBeTruthy();
    });

    it('should return empty string for valid field', () => {
      const firstName = component.registerForm.get('firstName');
      firstName?.setValue('Nicole');

      expect(component.getErrorMessage('firstName')).toBe('');
    });

    it('should handle non-existent field gracefully', () => {
      expect(component.isFieldInvalid('nonexistent')).toBeFalsy();
      expect(component.getErrorMessage('nonexistent')).toBe('');
    });

    it('should capitalize field labels in error messages', () => {
      const firstName = component.registerForm.get('firstName');
      firstName?.markAsTouched();

      const errorMessage = component.getErrorMessage('firstName');
      expect(errorMessage).toContain('First Name');
      expect(errorMessage.charAt(0)).toBe(errorMessage.charAt(0).toUpperCase());
    });
  });

  describe('Password Match Validator', () => {
    it('should return null when controls are missing', () => {
      const result = component.passwordMatchValidator(component.registerForm);
      expect(result).toBeNull();
    });

    it('should set error on confirmPassword when passwords mismatch', () => {
      component.registerForm.patchValue({
        password: 'StrongPassword1234',
        confirmPassword: 'DifferentPassword12',
      });

      const confirmPassword = component.registerForm.get('confirmPassword');
      expect(confirmPassword?.hasError('passwordMismatch')).toBeTruthy();
    });

    it('should return null when passwords match', () => {
      component.registerForm.patchValue({
        password: 'StrongPassword1234',
        confirmPassword: 'StrongPassword1234',
      });

      const confirmPassword = component.registerForm.get('confirmPassword');
      expect(confirmPassword?.hasError('passwordMismatch')).toBeFalsy();
    });
  });

  describe('Footer Integration', () => {
    it('should render footer component', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const footer = compiled.querySelector('app-footer');

      expect(footer).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have labels for all inputs', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const labels = compiled.querySelectorAll('label');

      expect(labels.length).toBe(5);
    });

    it('should have proper label-input associations', () => {
      const compiled = fixture.nativeElement as HTMLElement;

      const firstNameLabel = compiled.querySelector('label[for="firstName"]');
      const firstNameInput = compiled.querySelector('#firstName');

      expect(firstNameLabel).toBeTruthy();
      expect(firstNameInput).toBeTruthy();
    });
  });
});
