import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
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
});
