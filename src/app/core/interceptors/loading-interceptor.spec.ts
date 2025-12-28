import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';

import { loadingInterceptor } from './loading-interceptor';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { LoadingService } from '../services/loading/loading.service';

describe('loadingInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let loadingService: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting(),
        LoadingService,
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    loadingService = TestBed.inject(LoadingService);
  });

  afterEach(() => {
    httpMock.verify();
    loadingService.reset();
  });

  describe('Loading State Management', () => {
    it('should show loading when request starts', () => {
      httpClient.get('/api/test').subscribe();

      expect(loadingService.isLoading()).toBe(true);

      const req = httpMock.expectOne('/api/test');
      req.flush({});
    });

    it('should hide loading when request completes successfully', () => {
      httpClient.get('/api/test').subscribe();

      expect(loadingService.isLoading()).toBe(true);

      const req = httpMock.expectOne('/api/test');
      req.flush({ data: 'success' });

      expect(loadingService.isLoading()).toBe(false);
    });

    it('should hide loading when request fails', () => {
      httpClient.get('/api/test').subscribe({
        error: () => {},
      });

      expect(loadingService.isLoading()).toBe(true);

      const req = httpMock.expectOne('/api/test');
      req.flush('Error', { status: 500, statusText: 'Server Error' });

      expect(loadingService.isLoading()).toBe(false);
    });

    it('should hide loading on network error', () => {
      httpClient.get('/api/test').subscribe({
        error: () => {},
      });

      expect(loadingService.isLoading()).toBe(true);

      const req = httpMock.expectOne('/api/test');
      req.error(new ProgressEvent('Network error'));

      expect(loadingService.isLoading()).toBe(false);
    });
  });
});
