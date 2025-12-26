import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { RegisterComponent } from './register.component';
import { Router } from '@angular/router';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [{ provide: Router, useValue: routerSpy }],
    }).compileComponents();

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
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
      // First set mismatched passwords
      component.registerForm.patchValue({
        password: 'StrongStrongPassword12344',
        confirmPassword: 'StrongPassword5678',
      });

      let confirmPassword = component.registerForm.get('confirmPassword');
      expect(confirmPassword?.hasError('passwordMismatch')).toBeTruthy();

      // Then make them match
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
    });

    it('should submit when form is valid', fakeAsync(() => {
      component.registerForm.patchValue({
        firstName: 'Nicole',
        lastName: 'Smith',
        email: 'nicolesmith@example.com',
        password: 'StrongPassword1234',
        confirmPassword: 'StrongPassword1234',
      });

      component.onSubmit();

      expect(component.isLoading).toBeTruthy();
      expect(component.errorMessage).toBe('');
      expect(component.successMessage).toBe('');

      tick(1500);

      expect(component.isLoading).toBeFalsy();
      expect(component.successMessage).toContain('Account created successfully');

      tick(2000);

      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    }));

    it('should mark all fields as touched on invalid submission', () => {
      component.onSubmit();

      expect(component.registerForm.get('firstName')?.touched).toBeTruthy();
      expect(component.registerForm.get('lastName')?.touched).toBeTruthy();
      expect(component.registerForm.get('email')?.touched).toBeTruthy();
      expect(component.registerForm.get('password')?.touched).toBeTruthy();
      expect(component.registerForm.get('confirmPassword')?.touched).toBeTruthy();
    });

    it('should set loading state during submission', () => {
      component.registerForm.patchValue({
        firstName: 'Nicole',
        lastName: 'Smith',
        email: 'nicolesmith@example.com',
        password: 'StrongPassword1234',
        confirmPassword: 'StrongPassword1234',
      });

      component.onSubmit();

      expect(component.isLoading).toBeTruthy();
    });

    it('should clear error and success messages on new submission', () => {
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
    });

    it('should not include confirmPassword in submitted data', fakeAsync(() => {
      component.registerForm.patchValue({
        firstName: 'Nicole',
        lastName: 'Smith',
        email: 'nicolesmith@example.com',
        password: 'StrongPassword1234',
        confirmPassword: 'StrongPassword1234',
      });

      spyOn(console, 'log');
      component.onSubmit();
      tick(1500);

      expect(console.log).toHaveBeenCalledWith('Register attempt:', {
        firstName: 'Nicole',
        lastName: 'Smith',
        email: 'nicolesmith@example.com',
        password: 'StrongPassword1234',
      });
    }));
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
});
