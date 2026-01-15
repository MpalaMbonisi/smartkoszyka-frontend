import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordInputComponent } from './password-input-component';
import { ReactiveFormsModule } from '@angular/forms';

describe('PasswordInputComponent', () => {
  let component: PasswordInputComponent;
  let fixture: ComponentFixture<PasswordInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordInputComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('Password Visibility Toggle', () => {
    it('should initialize with password hidden', () => {
      expect(component.showPassword).toBe(false);

      const input = fixture.nativeElement.querySelector('input');
      expect(input.type).toBe('password');
    });

    it('should toggle password visibility on button click', () => {
      const toggleBtn = fixture.nativeElement.querySelector('.toggle-password-btn');

      toggleBtn.click();
      fixture.detectChanges();

      expect(component.showPassword).toBe(true);
      const input = fixture.nativeElement.querySelector('input');
      expect(input.type).toBe('text');
    });

    it('should toggle password visibility multiple times', () => {
      const toggleBtn = fixture.nativeElement.querySelector('.toggle-password-btn');

      // First toggle
      toggleBtn.click();
      expect(component.showPassword).toBe(true);

      // Second toggle
      toggleBtn.click();
      expect(component.showPassword).toBe(false);

      // Third toggle
      toggleBtn.click();
      expect(component.showPassword).toBe(true);
    });

    it('should update aria-label when toggling', () => {
      const toggleBtn = fixture.nativeElement.querySelector('.toggle-password-btn');

      expect(toggleBtn.getAttribute('aria-label')).toBe('Show password');

      toggleBtn.click();
      fixture.detectChanges();

      expect(toggleBtn.getAttribute('aria-label')).toBe('Hide password');
    });
  });
});
