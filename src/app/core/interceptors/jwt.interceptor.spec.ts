import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../services/auth/auth-service';
import { jwtInterceptor } from './jwt.interceptor';
import { TestBed } from '@angular/core/testing';

describe('jwtInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken', 'logout']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([jwtInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Token Injection', () => {
    it('should add Authorization header with Bearer token to requests', () => {
      const mockToken = 'mock-jwt-token-12345';
      authService.getToken.and.returnValue(mockToken);

      httpClient.get('/api/shopping-lists').subscribe();

      const req = httpMock.expectOne('/api/shopping-lists');
      expect(req.request.headers.has('Authorization')).toBe(true);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush({});
    });

    it('should not add Authorization header when token is null', () => {
      authService.getToken.and.returnValue(null);

      httpClient.get('/api/shopping-lists').subscribe();

      const req = httpMock.expectOne('/api/shopping-lists');
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });

    it('should not add Authorization header when token is empty string', () => {
      authService.getToken.and.returnValue('');

      httpClient.get('/api/shopping-lists').subscribe();

      const req = httpMock.expectOne('/api/shopping-lists');
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });
  });

  describe('Auth Endpoint Exclusion', () => {
    it('should not add token to login endpoint', () => {
      const mockToken = 'mock-jwt-token-12345';
      authService.getToken.and.returnValue(mockToken);

      httpClient
        .post('/auth/login', { email: 'nicolesmith@example.com', password: 'StrongPassword12345' })
        .subscribe();

      const req = httpMock.expectOne('/auth/login');
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });

    it('should not add token to register endpoint', () => {
      const mockToken = 'mock-jwt-token-12345';
      authService.getToken.and.returnValue(mockToken);

      httpClient
        .post('/auth/register', {
          email: 'nicolesmith@example.com',
          password: 'StrongPassword12345',
          firstName: 'Nicole',
          lastName: 'Smith',
        })
        .subscribe();

      const req = httpMock.expectOne('/auth/register');
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });

    it('should not add token when URL contains /auth/login', () => {
      const mockToken = 'mock-jwt-token-12345';
      authService.getToken.and.returnValue(mockToken);

      httpClient.post('http://localhost:8080/auth/login', {}).subscribe();

      const req = httpMock.expectOne('http://localhost:8080/auth/login');
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });

    it('should not add token when URL contains /auth/register', () => {
      const mockToken = 'mock-jwt-token-12345';
      authService.getToken.and.returnValue(mockToken);

      httpClient.post('http://localhost:8080/auth/register', {}).subscribe();

      const req = httpMock.expectOne('http://localhost:8080/auth/register');
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    });
  });

  describe('Protected Endpoints', () => {
    it('should add token to shopping list endpoints', () => {
      const mockToken = 'mock-jwt-token-12345';
      authService.getToken.and.returnValue(mockToken);

      httpClient.get('/api/shopping-lists/active').subscribe();

      const req = httpMock.expectOne('/api/shopping-lists/active');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush([]);
    });

    it('should add token to product endpoints', () => {
      const mockToken = 'mock-jwt-token-12345';
      authService.getToken.and.returnValue(mockToken);

      httpClient.get('/api/products').subscribe();

      const req = httpMock.expectOne('/api/products');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush([]);
    });

    it('should add token to category endpoints', () => {
      const mockToken = 'mock-jwt-token-12345';
      authService.getToken.and.returnValue(mockToken);

      httpClient.get('/api/categories').subscribe();

      const req = httpMock.expectOne('/api/categories');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush([]);
    });

    it('should add token to POST requests', () => {
      const mockToken = 'mock-jwt-token-12345';
      authService.getToken.and.returnValue(mockToken);

      httpClient.post('/api/shopping-lists', { title: 'New List' }).subscribe();

      const req = httpMock.expectOne('/api/shopping-lists');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush({});
    });

    it('should add token to PUT requests', () => {
      const mockToken = 'mock-jwt-token-12345';
      authService.getToken.and.returnValue(mockToken);

      httpClient.put('/api/shopping-lists/1', { title: 'Updated' }).subscribe();

      const req = httpMock.expectOne('/api/shopping-lists/1');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush({});
    });

    it('should add token to DELETE requests', () => {
      const mockToken = 'mock-jwt-token-12345';
      authService.getToken.and.returnValue(mockToken);

      httpClient.delete('/api/shopping-lists/1').subscribe();

      const req = httpMock.expectOne('/api/shopping-lists/1');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush({});
    });
  });

  describe('Error Handling', () => {
    it('should call logout on 401 Unauthorized error', () => {
      const mockToken = 'mock-expired-jwt-token-123';
      authService.getToken.and.returnValue(mockToken);

      httpClient.get('/api/shopping-lists').subscribe({
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(401);
          expect(authService.logout).toHaveBeenCalled();
        },
      });

      const req = httpMock.expectOne('/api/shopping-lists');
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('should not call logout on 400 Bad Request error', () => {
      const mockToken = 'mock-valid-jwt-token-12345';
      authService.getToken.and.returnValue(mockToken);

      httpClient.post('/api/shopping-lists', {}).subscribe({
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(400);
          expect(authService.logout).not.toHaveBeenCalled();
        },
      });

      const req = httpMock.expectOne('/api/shopping-lists');
      req.flush({ message: 'Bad Request' }, { status: 400, statusText: 'Bad Request' });
    });

    it('should not call logout on 404 Not Found error', () => {
      const mockToken = 'mock-valid-jwt-token-12345';
      authService.getToken.and.returnValue(mockToken);

      httpClient.get('/api/shopping-lists/999').subscribe({
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(404);
          expect(authService.logout).not.toHaveBeenCalled();
        },
      });

      const req = httpMock.expectOne('/api/shopping-lists/999');
      req.flush({ message: 'Not Found' }, { status: 404, statusText: 'Not Found' });
    });

    it('should not call logout on 500 Internal Server Error', () => {
      const mockToken = 'mock-valid-jwt-token-12345';
      authService.getToken.and.returnValue(mockToken);

      httpClient.get('/api/shopping-lists').subscribe({
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(500);
          expect(authService.logout).not.toHaveBeenCalled();
        },
      });

      const req = httpMock.expectOne('/api/shopping-lists');
      req.flush({ message: 'Server Error' }, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should propagate error after handling 401', () => {
      const mockToken = 'mock-expired-jwt-token-123';
      authService.getToken.and.returnValue(mockToken);

      let errorReceived = false;

      httpClient.get('/api/shopping-lists').subscribe({
        error: (error: HttpErrorResponse) => {
          errorReceived = true;
          expect(error.status).toBe(401);
        },
      });

      const req = httpMock.expectOne('/api/shopping-lists');
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      expect(errorReceived).toBe(true);
    });
  });

  describe('Multiple Requests', () => {
    it('should add token to multiple concurrent requests', () => {
      const mockToken = 'mock-jwt-token-12345';
      authService.getToken.and.returnValue(mockToken);

      httpClient.get('/api/products').subscribe();
      httpClient.get('/api/categories').subscribe();
      httpClient.get('/api/shopping-lists').subscribe();

      const req1 = httpMock.expectOne('/api/products');
      const req2 = httpMock.expectOne('/api/categories');
      const req3 = httpMock.expectOne('/api/shopping-lists');

      expect(req1.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req2.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req3.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);

      req1.flush([]);
      req2.flush([]);
      req3.flush([]);
    });

    it('should handle mix of auth and protected endpoints', () => {
      const mockToken = 'mock-jwt-token-12345';
      authService.getToken.and.returnValue(mockToken);

      httpClient.post('/auth/login', {}).subscribe();
      httpClient.get('/api/products').subscribe();

      const loginReq = httpMock.expectOne('/auth/login');
      const productsReq = httpMock.expectOne('/api/products');

      expect(loginReq.request.headers.has('Authorization')).toBe(false);
      expect(productsReq.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);

      loginReq.flush({});
      productsReq.flush([]);
    });
  });

  describe('Request Cloning', () => {
    it('should not modify original request object', () => {
      const mockToken = 'mock-jwt-token-12345';
      authService.getToken.and.returnValue(mockToken);

      httpClient.get('/api/shopping-lists').subscribe();

      const req = httpMock.expectOne('/api/shopping-lists');

      // Interceptor should clone the request, not modify original
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      req.flush({});
    });

    it('should preserve existing headers when adding Authorization', () => {
      const mockToken = 'mock-jwt-token-12345';
      authService.getToken.and.returnValue(mockToken);

      httpClient
        .get('/api/shopping-lists', {
          headers: {
            'Content-Type': 'application/json',
            'X-Custom-Header': 'custom-value',
          },
        })
        .subscribe();

      const req = httpMock.expectOne('/api/shopping-lists');

      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      expect(req.request.headers.get('X-Custom-Header')).toBe('custom-value');
      req.flush({});
    });
  });
});
