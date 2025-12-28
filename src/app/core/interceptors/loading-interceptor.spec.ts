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

  describe('Multiple Concurrent Requests', () => {
    it('should keep loading true while any request is pending', () => {
      // Start 3 requests
      httpClient.get('/api/test1').subscribe();
      httpClient.get('/api/test2').subscribe();
      httpClient.get('/api/test3').subscribe();

      expect(loadingService.isLoading()).toBe(true);

      // Complete first request
      const req1 = httpMock.expectOne('/api/test1');
      req1.flush({});
      expect(loadingService.isLoading()).toBe(true); // Still 2 pending

      // Complete second request
      const req2 = httpMock.expectOne('/api/test2');
      req2.flush({});
      expect(loadingService.isLoading()).toBe(true); // Still 1 pending

      // Complete third request
      const req3 = httpMock.expectOne('/api/test3');
      req3.flush({});
      expect(loadingService.isLoading()).toBe(false); // All done
    });

    it('should handle mixed success and error responses', () => {
      httpClient.get('/api/success').subscribe();
      httpClient.get('/api/error').subscribe({ error: () => {} });

      expect(loadingService.isLoading()).toBe(true);

      // Complete success request
      const successReq = httpMock.expectOne('/api/success');
      successReq.flush({});
      expect(loadingService.isLoading()).toBe(true);

      // Complete error request
      const errorReq = httpMock.expectOne('/api/error');
      errorReq.flush('Error', { status: 500, statusText: 'Server Error' });
      expect(loadingService.isLoading()).toBe(false);
    });

    it('should handle rapid sequential requests', () => {
      // Fire 5 requests rapidly
      for (let i = 0; i < 5; i++) {
        httpClient.get(`/api/test${i}`).subscribe();
      }

      expect(loadingService.isLoading()).toBe(true);

      // Complete all requests
      for (let i = 0; i < 5; i++) {
        const req = httpMock.expectOne(`/api/test${i}`);
        req.flush({});
      }

      expect(loadingService.isLoading()).toBe(false);
    });
  });

  describe('Different HTTP Methods', () => {
    it('should handle GET requests', () => {
      httpClient.get('/api/test').subscribe();

      expect(loadingService.isLoading()).toBe(true);

      const req = httpMock.expectOne('/api/test');
      req.flush({});

      expect(loadingService.isLoading()).toBe(false);
    });

    it('should handle POST requests', () => {
      httpClient.post('/api/test', { data: 'test' }).subscribe();

      expect(loadingService.isLoading()).toBe(true);

      const req = httpMock.expectOne('/api/test');
      req.flush({});

      expect(loadingService.isLoading()).toBe(false);
    });

    it('should handle PUT requests', () => {
      httpClient.put('/api/test/1', { data: 'updated' }).subscribe();

      expect(loadingService.isLoading()).toBe(true);

      const req = httpMock.expectOne('/api/test/1');
      req.flush({});

      expect(loadingService.isLoading()).toBe(false);
    });

    it('should handle DELETE requests', () => {
      httpClient.delete('/api/test/1').subscribe();

      expect(loadingService.isLoading()).toBe(true);

      const req = httpMock.expectOne('/api/test/1');
      req.flush({});

      expect(loadingService.isLoading()).toBe(false);
    });

    it('should handle PATCH requests', () => {
      httpClient.patch('/api/test/1', { field: 'value' }).subscribe();

      expect(loadingService.isLoading()).toBe(true);

      const req = httpMock.expectOne('/api/test/1');
      req.flush({});

      expect(loadingService.isLoading()).toBe(false);
    });
  });
});
