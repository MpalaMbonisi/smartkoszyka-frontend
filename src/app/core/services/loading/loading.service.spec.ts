import { TestBed } from '@angular/core/testing';

import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should initialize with loading set to false', () => {
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('show()', () => {
    it('should set loading to true when called', () => {
      service.show();

      expect(service.isLoading()).toBe(true);
    });

    it('should keep loading true when called multiple times', () => {
      service.show();
      service.show();
      service.show();

      expect(service.isLoading()).toBe(true);
    });

    it('should increment internal counter on each call', () => {
      service.show();
      service.show();
      service.hide();

      // Still loading because show was called twice, hide once
      expect(service.isLoading()).toBe(true);
    });
  });

  describe('hide()', () => {
    it('should set loading to false when count reaches zero', () => {
      service.show();
      service.hide();

      expect(service.isLoading()).toBe(false);
    });

    it('should not set loading to false if count is still positive', () => {
      service.show();
      service.show();
      service.hide();

      expect(service.isLoading()).toBe(true);

      service.hide();
      expect(service.isLoading()).toBe(false);
    });

    it('should not go below zero when called more than show', () => {
      service.hide();
      service.hide();
      service.hide();

      expect(service.isLoading()).toBe(false);
    });

    it('should handle hide before show gracefully', () => {
      service.hide();

      expect(service.isLoading()).toBe(false);

      service.show();
      expect(service.isLoading()).toBe(true);
    });
  });

  describe('reset()', () => {
    it('should set loading to false immediately', () => {
      service.show();
      service.show();
      service.show();

      service.reset();

      expect(service.isLoading()).toBe(false);
    });

    it('should reset internal counter', () => {
      service.show();
      service.show();
      service.reset();

      service.show();
      service.hide();

      // Should be false because counter was reset
      expect(service.isLoading()).toBe(false);
    });

    it('should work when already at zero', () => {
      service.reset();

      expect(service.isLoading()).toBe(false);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle multiple show/hide cycles', () => {
      // First cycle
      service.show();
      expect(service.isLoading()).toBe(true);
      service.hide();
      expect(service.isLoading()).toBe(false);

      // Second cycle
      service.show();
      expect(service.isLoading()).toBe(true);
      service.hide();
      expect(service.isLoading()).toBe(false);
    });

    it('should handle overlapping requests', () => {
      // Simulate 3 concurrent requests
      service.show(); // Request 1 starts
      service.show(); // Request 2 starts
      service.show(); // Request 3 starts

      expect(service.isLoading()).toBe(true);

      service.hide(); // Request 1 completes
      expect(service.isLoading()).toBe(true); // Still 2 pending

      service.hide(); // Request 2 completes
      expect(service.isLoading()).toBe(true); // Still 1 pending

      service.hide(); // Request 3 completes
      expect(service.isLoading()).toBe(false); // All done
    });

    it('should handle rapid show/hide sequences', () => {
      for (let i = 0; i < 10; i++) {
        service.show();
      }
      expect(service.isLoading()).toBe(true);

      for (let i = 0; i < 10; i++) {
        service.hide();
      }
      expect(service.isLoading()).toBe(false);
    });

    it('should handle unbalanced show/hide with reset', () => {
      service.show();
      service.show();
      service.show();

      service.hide();
      expect(service.isLoading()).toBe(true);

      service.reset();
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('Signal Reactivity', () => {
    it('should update signal when loading state changes', () => {
      const initialState = service.isLoading();
      expect(initialState).toBe(false);

      service.show();
      const loadingState = service.isLoading();
      expect(loadingState).toBe(true);

      service.hide();
      const finalState = service.isLoading();
      expect(finalState).toBe(false);
    });

    it('should be reactive to multiple subscribers', () => {
      let subscriber1Value = service.isLoading();
      let subscriber2Value = service.isLoading();

      expect(subscriber1Value).toBe(false);
      expect(subscriber2Value).toBe(false);

      service.show();

      subscriber1Value = service.isLoading();
      subscriber2Value = service.isLoading();

      expect(subscriber1Value).toBe(true);
      expect(subscriber2Value).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle show after reset', () => {
      service.show();
      service.reset();
      service.show();

      expect(service.isLoading()).toBe(true);

      service.hide();
      expect(service.isLoading()).toBe(false);
    });

    it('should handle multiple resets', () => {
      service.show();
      service.reset();
      service.reset();
      service.reset();

      expect(service.isLoading()).toBe(false);
    });

    it('should maintain correct state after error scenarios', () => {
      service.show();
      service.show();

      // Simulate error - only one hide called
      service.hide();

      expect(service.isLoading()).toBe(true);

      // Recovery with reset
      service.reset();
      expect(service.isLoading()).toBe(false);
    });
  });
});
