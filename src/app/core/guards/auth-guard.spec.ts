import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { authGuard } from './auth-guard';
import { AuthService } from '../services/auth/auth-service';

describe('authGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let mockRoute: ActivatedRouteSnapshot;
  let mockState: RouterStateSnapshot;

  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Create mock route and state
    mockRoute = {} as ActivatedRouteSnapshot;
    mockState = { url: '/dashboard' } as RouterStateSnapshot;
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  describe('Authenticated User', () => {
    it('should allow access when user is authenticated', () => {
      authService.isAuthenticated.and.returnValue(true);

      const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(result).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should not redirect when user is authenticated', () => {
      authService.isAuthenticated.and.returnValue(true);

      TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should allow access to dashboard when authenticated', () => {
      authService.isAuthenticated.and.returnValue(true);
      mockState = { url: '/dashboard' } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(result).toBe(true);
    });

    it('should allow access to shopping lists when authenticated', () => {
      authService.isAuthenticated.and.returnValue(true);
      mockState = { url: '/shopping-lists' } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(result).toBe(true);
    });

    it('should allow access to any protected route when authenticated', () => {
      authService.isAuthenticated.and.returnValue(true);
      mockState = { url: '/any-protected-route' } as RouterStateSnapshot;

      const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(result).toBe(true);
    });
  });

  describe('Unauthenticated User', () => {
    it('should deny access when user is not authenticated', () => {
      authService.isAuthenticated.and.returnValue(false);

      const result = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(result).toBe(false);
    });

    it('should redirect to login when user is not authenticated', () => {
      authService.isAuthenticated.and.returnValue(false);
      mockState = { url: '/dashboard' } as RouterStateSnapshot;

      TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(router.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnUrl: '/dashboard' },
      });
    });

    it('should store attempted URL in query params', () => {
      authService.isAuthenticated.and.returnValue(false);
      mockState = { url: '/shopping-lists' } as RouterStateSnapshot;

      TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(router.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnUrl: '/shopping-lists' },
      });
    });

    it('should handle root path attempt', () => {
      authService.isAuthenticated.and.returnValue(false);
      mockState = { url: '/' } as RouterStateSnapshot;

      TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(router.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnUrl: '/' },
      });
    });

    it('should handle nested route attempts', () => {
      authService.isAuthenticated.and.returnValue(false);
      mockState = { url: '/shopping-lists/1/items' } as RouterStateSnapshot;

      TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(router.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnUrl: '/shopping-lists/1/items' },
      });
    });

    it('should handle routes with query parameters', () => {
      authService.isAuthenticated.and.returnValue(false);
      mockState = { url: '/dashboard?tab=active' } as RouterStateSnapshot;

      TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(router.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnUrl: '/dashboard?tab=active' },
      });
    });
  });

  describe('Multiple Guard Invocations', () => {
    it('should consistently allow authenticated user', () => {
      authService.isAuthenticated.and.returnValue(true);

      const result1 = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));
      const result2 = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));
      const result3 = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(true);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should consistently deny unauthenticated user', () => {
      authService.isAuthenticated.and.returnValue(false);

      const result1 = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));
      const result2 = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(router.navigate).toHaveBeenCalledTimes(2);
    });

    it('should handle authentication state changes', () => {
      // First call - not authenticated
      authService.isAuthenticated.and.returnValue(false);
      const result1 = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      // Second call - now authenticated
      authService.isAuthenticated.and.returnValue(true);
      const result2 = TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(result1).toBe(false);
      expect(result2).toBe(true);
      expect(router.navigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty URL', () => {
      authService.isAuthenticated.and.returnValue(false);
      mockState = { url: '' } as RouterStateSnapshot;

      TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(router.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnUrl: '' },
      });
    });

    it('should handle URL with hash', () => {
      authService.isAuthenticated.and.returnValue(false);
      mockState = { url: '/dashboard#section1' } as RouterStateSnapshot;

      TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(router.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnUrl: '/dashboard#section1' },
      });
    });

    it('should handle complex URL with multiple query params', () => {
      authService.isAuthenticated.and.returnValue(false);
      mockState = { url: '/shopping-lists?sort=date&filter=active&page=2' } as RouterStateSnapshot;

      TestBed.runInInjectionContext(() => authGuard(mockRoute, mockState));

      expect(router.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnUrl: '/shopping-lists?sort=date&filter=active&page=2' },
      });
    });
  });
});
