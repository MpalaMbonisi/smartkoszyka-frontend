import { ComponentFixture, TestBed } from '@angular/core/testing';

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
      email?.setValue('test@example.com');

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
      password?.setValue('validpassword123');

      expect(password?.valid).toBeTruthy();
    });

    it('should show minlength error message', () => {
      const password = component.loginForm.get('password');
      password?.setValue('short');
      password?.markAsTouched();

      expect(component.getErrorMessage('password')).toBe('Password must be at least 8 characters');
    });
  });
});
