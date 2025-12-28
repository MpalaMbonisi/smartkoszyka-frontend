import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingSpinner } from './loading-spinner';
import { LoadingService } from '../../../core/services/loading/loading.service';

describe('LoadingSpinner', () => {
  let component: LoadingSpinner;
  let fixture: ComponentFixture<LoadingSpinner>;
  let loadingService: LoadingService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSpinner],
      providers: [LoadingService],
    }).compileComponents();

    loadingService = TestBed.inject(LoadingService);
    fixture = TestBed.createComponent(LoadingSpinner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Visibility', () => {
    it('should not display spinner when loading is false', () => {
      loadingService.reset();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const overlay = compiled.querySelector('.loading-overlay');

      expect(overlay).toBeFalsy();
    });

    it('should display spinner when loading is true', () => {
      loadingService.show();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const overlay = compiled.querySelector('.loading-overlay');

      expect(overlay).toBeTruthy();
    });

    it('should hide spinner when loading changes to false', () => {
      loadingService.show();
      fixture.detectChanges();

      let compiled = fixture.nativeElement as HTMLElement;
      let overlay = compiled.querySelector('.loading-overlay');
      expect(overlay).toBeTruthy();

      loadingService.hide();
      fixture.detectChanges();

      compiled = fixture.nativeElement as HTMLElement;
      overlay = compiled.querySelector('.loading-overlay');
      expect(overlay).toBeFalsy();
    });

    it('should show spinner when loading changes to true', () => {
      loadingService.reset();
      fixture.detectChanges();

      let compiled = fixture.nativeElement as HTMLElement;
      let overlay = compiled.querySelector('.loading-overlay');
      expect(overlay).toBeFalsy();

      loadingService.show();
      fixture.detectChanges();

      compiled = fixture.nativeElement as HTMLElement;
      overlay = compiled.querySelector('.loading-overlay');
      expect(overlay).toBeTruthy();
    });
  });

  describe('Spinner Elements', () => {
    it('should contain spinner element when loading', () => {
      loadingService.show();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const spinner = compiled.querySelector('.spinner');

      expect(spinner).toBeTruthy();
    });

    it('should contain loading text when loading', () => {
      loadingService.show();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const loadingText = compiled.querySelector('.loading-text');

      expect(loadingText).toBeTruthy();
      expect(loadingText?.textContent).toBe('Loading...');
    });

    it('should have spinner container with correct structure', () => {
      loadingService.show();
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      const spinnerContainer = compiled.querySelector('.spinner-container');

      expect(spinnerContainer).toBeTruthy();

      const spinner = spinnerContainer?.querySelector('.spinner');
      const text = spinnerContainer?.querySelector('.loading-text');

      expect(spinner).toBeTruthy();
      expect(text).toBeTruthy();
    });
  });

  describe('LoadingService Integration', () => {
    it('should have access to loadingService', () => {
      expect(component.loadingService).toBeTruthy();
      expect(component.loadingService).toBe(loadingService);
    });

    it('should react to loadingService state changes', () => {
      loadingService.reset();
      fixture.detectChanges();

      let compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.loading-overlay')).toBeFalsy();

      loadingService.show();
      fixture.detectChanges();

      compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.loading-overlay')).toBeTruthy();

      loadingService.hide();
      fixture.detectChanges();

      compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.loading-overlay')).toBeFalsy();
    });

    it('should handle multiple show/hide cycles', () => {
      for (let i = 0; i < 3; i++) {
        loadingService.show();
        fixture.detectChanges();

        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.querySelector('.loading-overlay')).toBeTruthy();

        loadingService.hide();
        fixture.detectChanges();

        const compiledAfter = fixture.nativeElement as HTMLElement;
        expect(compiledAfter.querySelector('.loading-overlay')).toBeFalsy();
      }
    });

    it('should remain visible during concurrent operations', () => {
      loadingService.show(); // Operation 1
      loadingService.show(); // Operation 2
      fixture.detectChanges();

      let compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.loading-overlay')).toBeTruthy();

      loadingService.hide(); // Operation 1 completes
      fixture.detectChanges();

      compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.loading-overlay')).toBeTruthy();

      loadingService.hide(); // Operation 2 completes
      fixture.detectChanges();

      compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.querySelector('.loading-overlay')).toBeFalsy();
    });
  });
});
