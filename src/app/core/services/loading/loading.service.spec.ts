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
});
