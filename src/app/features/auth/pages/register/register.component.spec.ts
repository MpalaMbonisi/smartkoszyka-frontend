import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
    }).compileComponents();

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
      password?.setValue('StrongPassword1234');

      expect(password?.valid).toBeTruthy();
    });
  });

  describe('Password Confirmation Validation', () => {
    it('should be invalid when passwords do not match', () => {
      component.registerForm.patchValue({
        password: 'StrongPassword1234',
        confirmPassword: 'StrongPassword5678',
      });

      const confirmPassword = component.registerForm.get('confirmPassword');
      expect(confirmPassword?.hasError('passwordMismatch')).toBeTruthy();
    });

    it('should be valid when passwords match', () => {
      component.registerForm.patchValue({
        password: 'StrongPassword1234',
        confirmPassword: 'StrongPassword1234',
      });

      const confirmPassword = component.registerForm.get('confirmPassword');
      expect(confirmPassword?.hasError('passwordMismatch')).toBeFalsy();
    });

    it('should show password mismatch error message', () => {
      component.registerForm.patchValue({
        password: 'StrongPassword1234',
        confirmPassword: 'StrongPassword5678',
      });
      component.registerForm.get('confirmPassword')?.markAsTouched();

      expect(component.getErrorMessage('confirmPassword')).toBe('Passwords do not match');
    });

    it('should clear mismatch error when passwords match', () => {
      // First set mismatched passwords
      component.registerForm.patchValue({
        password: 'StrongPassword1234',
        confirmPassword: 'StrongPassword5678',
      });

      let confirmPassword = component.registerForm.get('confirmPassword');
      expect(confirmPassword?.hasError('passwordMismatch')).toBeTruthy();

      // Then make them match
      component.registerForm.patchValue({
        confirmPassword: 'StrongPassword1234',
      });

      confirmPassword = component.registerForm.get('confirmPassword');
      expect(confirmPassword?.hasError('passwordMismatch')).toBeFalsy();
    });
  });
});
