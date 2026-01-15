import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-input-component',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="password-input-wrapper">
      <input
        [type]="showPassword ? 'text' : 'password'"
        [id]="inputId"
        [placeholder]="placeholder"
        [value]="value"
        [class.invalid]="isInvalid"
        (input)="onInput($event)"
        (blur)="onTouched()"
      />
      <button
        type="button"
        class="toggle-password-btn"
        (click)="togglePassword()"
        [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'"
      >
        <span class="password-status">{{ showPassword ? 'hide' : 'show' }}</span>
      </button>
    </div>
  `,
  styles: [
    `
      .password-input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }

      input {
        flex: 1;
        padding-right: 3rem;
      }

      .toggle-password-btn {
        position: absolute;
        right: 0.5rem;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.3s ease;

        &:hover {
          opacity: 0.7;
        }

        .password-status {
          font-size: 1rem;
          color: #2b2a2a;
        }
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordInputComponent),
      multi: true,
    },
  ],
})
export class PasswordInputComponent implements ControlValueAccessor {
  @Input() inputId = '';
  @Input() placeholder = 'Enter password';
  @Input() isInvalid = false;

  value = '';
  showPassword = false;
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
  }

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
}
