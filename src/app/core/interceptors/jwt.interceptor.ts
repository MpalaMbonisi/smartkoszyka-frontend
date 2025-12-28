import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth-service';
import { catchError, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Skip adding token for auth endpoints
  const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/register');

  if (isAuthEndpoint) {
    return next(req);
  }

  // Get token from auth service
  const token = authService.getToken();

  // Clone request and add authorisation header if token exists
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Handle response and catch errors
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Unauthorized - token expired or invalid
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
