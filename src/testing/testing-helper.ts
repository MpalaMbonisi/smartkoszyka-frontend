import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormGroup } from '@angular/forms';

/**
 * Test helper utilities for Angular component testing
 */

/**
 * Find element by CSS selector
 */
export function findByCss<T>(fixture: ComponentFixture<T>, selector: string): DebugElement {
  return fixture.debugElement.query(By.css(selector));
}

/**
 * Find all elements by CSS selector
 */
export function findAllByCss<T>(fixture: ComponentFixture<T>, selector: string): DebugElement[] {
  return fixture.debugElement.queryAll(By.css(selector));
}

/**
 * Get native element by CSS selector
 */
export function findNativeElement<T>(
  fixture: ComponentFixture<T>,
  selector: string
): HTMLElement | null {
  const debugElement = findByCss(fixture, selector);
  return debugElement ? debugElement.nativeElement : null;
}

/**
 * Get text content of an element
 */
export function getTextContent<T>(fixture: ComponentFixture<T>, selector: string): string {
  const element = findNativeElement(fixture, selector);
  return element ? element.textContent?.trim() || '' : '';
}

/**
 * Click an element
 */
export function clickElement<T>(fixture: ComponentFixture<T>, selector: string): void {
  const element = findNativeElement(fixture, selector);
  if (element) {
    element.click();
    fixture.detectChanges();
  }
}

/**
 * Set input value and trigger input event
 */
export function setInputValue<T>(
  fixture: ComponentFixture<T>,
  selector: string,
  value: string
): void {
  const input = findNativeElement(fixture, selector) as HTMLInputElement;
  if (input) {
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }
}

/**
 * Check if element exists
 */
export function elementExists<T>(fixture: ComponentFixture<T>, selector: string): boolean {
  return findNativeElement(fixture, selector) !== null;
}

/**
 * Check if element has class
 */
export function hasClass<T>(
  fixture: ComponentFixture<T>,
  selector: string,
  className: string
): boolean {
  const element = findNativeElement(fixture, selector);
  return element ? element.classList.contains(className) : false;
}

/**
 * Get element attribute value
 */
export function getAttribute<T>(
  fixture: ComponentFixture<T>,
  selector: string,
  attribute: string
): string | null {
  const element = findNativeElement(fixture, selector);
  return element ? element.getAttribute(attribute) : null;
}

/**
 * Check if element is disabled
 */
export function isDisabled<T>(fixture: ComponentFixture<T>, selector: string): boolean {
  const element = findNativeElement(fixture, selector) as HTMLInputElement | HTMLButtonElement;
  return element ? element.disabled : false;
}

/**
 * Mock localStorage for testing
 */
export class MockLocalStorage {
  private store: { [key: string]: string } = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }

  get length(): number {
    return Object.keys(this.store).length;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

/**
 * Setup localStorage mock
 */
export function setupLocalStorageMock(): MockLocalStorage {
  const mockLocalStorage = new MockLocalStorage();

  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });

  return mockLocalStorage;
}

/**
 * Mock matchMedia for testing
 */
export function setupMatchMediaMock(matches: boolean = false): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jasmine.createSpy('matchMedia').and.returnValue({
      matches,
      media: '',
      onchange: null,
      addListener: jasmine.createSpy(),
      removeListener: jasmine.createSpy(),
      addEventListener: jasmine.createSpy(),
      removeEventListener: jasmine.createSpy(),
      dispatchEvent: jasmine.createSpy(),
    }),
  });
}

/**
 * Wait for async operations to complete
 */
export async function waitForAsync(ms: number = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Interface for components that contain a form
 */
interface FormComponent {
  form?: FormGroup;
  loginForm?: FormGroup;
  registerForm?: FormGroup;
  [key: string]: unknown;
}

/**
 * Trigger form validation
 */
export function triggerValidation<T>(fixture: ComponentFixture<T>): void {
  const component = fixture.componentInstance as unknown as FormComponent;
  const form = component.form || component.loginForm || component.registerForm;

  if (form) {
    form.markAllAsTouched();
    fixture.detectChanges();
  }
}

/**
 * Fill form with values
 */
export function fillForm<T>(
  fixture: ComponentFixture<T>,
  formValues: Record<string, unknown>
): void {
  const component = fixture.componentInstance as unknown as FormComponent;
  const form = component.form || component.loginForm || component.registerForm;

  if (form) {
    form.patchValue(formValues);
    fixture.detectChanges();
  }
}

/**
 * Expect element to contain text
 */
export function expectTextContent<T>(
  fixture: ComponentFixture<T>,
  selector: string,
  expectedText: string
): void {
  const text = getTextContent(fixture, selector);
  expect(text).toContain(expectedText);
}

/**
 * Expect element to exist
 */
export function expectElementToExist<T>(fixture: ComponentFixture<T>, selector: string): void {
  expect(elementExists(fixture, selector)).toBeTruthy();
}

/**
 * Expect element not to exist
 */
export function expectElementNotToExist<T>(fixture: ComponentFixture<T>, selector: string): void {
  expect(elementExists(fixture, selector)).toBeFalsy();
}
