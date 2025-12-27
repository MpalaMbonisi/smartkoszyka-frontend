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
});
