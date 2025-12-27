import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthResponse, AuthService } from './auth-service';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.prod';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;
  let localStorageSpy: jasmine.SpyObj<Storage>;

  const mockAuthResponse: AuthResponse = {
    token: 'mock-jwt-token-12345',
    email: 'nicolesmith@example.com',
    firstName: 'Nicole',
    lastName: 'Smith',
  };

  beforeEach(() => {
    localStorageSpy = jasmine.createSpyObj('localStorage', ['getItem', 'setItem', 'removeItem']);

    Object.defineProperty(window, 'localStorage', {
      value: localStorageSpy,
      writable: true,
    });

    TestBed.configureTestingModule({
      providers: [AuthService, provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });

    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    spyOn(router, 'navigate');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should send login request to correct endpoint', () => {
      const credentials = {
        email: 'nicolesmith@example.com',
        password: 'StrongStrongPassword12344',
      };

      service.login(credentials).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}${environment.apiEndpoints.auth.login}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockAuthResponse);
    });

    it('should store token and user data on successful login', () => {
      const credentials = {
        email: 'nicolesmith@example.com',
        password: 'StrongStrongPassword12344',
      };

      service.login(credentials).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}${environment.apiEndpoints.auth.login}`);
      req.flush(mockAuthResponse);

      expect(localStorageSpy.setItem).toHaveBeenCalledWith('auth-token', mockAuthResponse.token);
      expect(localStorageSpy.setItem).toHaveBeenCalledWith('auth-user', jasmine.any(String));
    });

    it('should update isAuthenticated signal on successful login', done => {
      const credentials = {
        email: 'nicolesmith@example.com',
        password: 'StrongStrongPassword12344',
      };

      service.login(credentials).subscribe(() => {
        expect(service.isAuthenticated()).toBe(true);
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}${environment.apiEndpoints.auth.login}`);
      req.flush(mockAuthResponse);
    });

    it('should update currentUser$ observable on successful login', done => {
      const credentials = {
        email: 'nicolesmith@example.com',
        password: 'StrongStrongPassword12344',
      };

      service.login(credentials).subscribe(() => {
        service.currentUser$.subscribe(user => {
          expect(user).toEqual({
            email: mockAuthResponse.email,
            firstName: mockAuthResponse.firstName,
            lastName: mockAuthResponse.lastName,
          });
          done();
        });
      });

      const req = httpMock.expectOne(`${environment.apiUrl}${environment.apiEndpoints.auth.login}`);
      req.flush(mockAuthResponse);
    });

    it('should handle error response with message array', done => {
      const credentials = { email: 'nicolesmith@example.com', password: 'WrongPassword' };
      const errorResponse = {
        message: ['Invalid email', 'Password incorrect'],
      };

      service.login(credentials).subscribe({
        error: error => {
          expect(error.message).toBe('Invalid email, Password incorrect');
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}${environment.apiEndpoints.auth.login}`);
      req.flush(errorResponse, { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle error response with single message', done => {
      const credentials = { email: 'nicolesmith@example.com', password: 'WrongPassword' };
      const errorResponse = {
        message: 'Invalid credentials',
      };

      service.login(credentials).subscribe({
        error: error => {
          expect(error.message).toBe('Invalid credentials');
          done();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}${environment.apiEndpoints.auth.login}`);
      req.flush(errorResponse, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('register', () => {
    it('should send register request to correct endpoint', () => {
      const registerData = {
        email: 'nicolesmith.new@example.com',
        password: 'StrongPassword1234',
        firstName: 'Nicole',
        lastName: 'Smith',
      };

      service.register(registerData).subscribe();

      const req = httpMock.expectOne(
        `${environment.apiUrl}${environment.apiEndpoints.auth.register}`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerData);
      req.flush(mockAuthResponse);
    });

    it('should store token and user data on successful registration', () => {
      const registerData = {
        email: 'nicolesmith.new@example.com',
        password: 'StrongPassword1234',
        firstName: 'Nicole',
        lastName: 'Smith',
      };

      service.register(registerData).subscribe();

      const req = httpMock.expectOne(
        `${environment.apiUrl}${environment.apiEndpoints.auth.register}`
      );
      req.flush(mockAuthResponse);

      expect(localStorageSpy.setItem).toHaveBeenCalledWith('auth-token', mockAuthResponse.token);
      expect(localStorageSpy.setItem).toHaveBeenCalledWith('auth-user', jasmine.any(String));
    });

    it('should update authentication state on successful registration', done => {
      const registerData = {
        email: 'nicolesmith.new@example.com',
        password: 'StrongPassword1234',
        firstName: 'Nicole',
        lastName: 'Smith',
      };

      service.register(registerData).subscribe(() => {
        expect(service.isAuthenticated()).toBe(true);
        done();
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}${environment.apiEndpoints.auth.register}`
      );
      req.flush(mockAuthResponse);
    });

    it('should handle registration error with conflict status', done => {
      const registerData = {
        email: 'nicolesmith.existing@example.com',
        password: 'StrongPassword1234',
        firstName: 'Nicole',
        lastName: 'Smith',
      };
      const errorResponse = {
        message: 'Email already exists',
      };

      service.register(registerData).subscribe({
        error: error => {
          expect(error.message).toBe('Email already exists');
          done();
        },
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}${environment.apiEndpoints.auth.register}`
      );
      req.flush(errorResponse, { status: 409, statusText: 'Conflict' });
    });
  });

  describe('logout', () => {
    it('should clear localStorage on logout', () => {
      service.logout();

      expect(localStorageSpy.removeItem).toHaveBeenCalledWith('auth-token');
      expect(localStorageSpy.removeItem).toHaveBeenCalledWith('auth-user');
    });

    it('should update isAuthenticated signal to false', () => {
      service.logout();

      expect(service.isAuthenticated()).toBe(false);
    });

    it('should update currentUser$ to null', done => {
      service.logout();

      service.currentUser$.subscribe(user => {
        expect(user).toBeNull();
        done();
      });
    });

    it('should navigate to login page', () => {
      service.logout();

      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
