import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.prod';

export interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface User {
  email: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth-token';
  private readonly USER_KEY = 'auth-user';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  isAuthenticated = signal<boolean>(this.hasToken());

  private http: HttpClient = inject(HttpClient);
  private router: Router = inject(Router);

  login(credentials: LoginRequest): Observable<AuthResponse> {
    const url = `${environment.apiUrl}${environment.apiEndpoints.auth.login}`;

    return this.http.post<AuthResponse>(url, credentials).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(this.handleError)
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    const url = `${environment.apiUrl}${environment.apiEndpoints.auth.register}`;

    return this.http.post<AuthResponse>(url, data).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(this.handleError)
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);

    const user: User = {
      email: response.email,
      firstName: response.firstName,
      lastName: response.lastName,
    };

    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isAuthenticated.set(true);

    this.router.navigate(['/dashboard']);
  }

  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    }
    return null;
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred. Please try again.';

    if (error.error?.message) {
      if (Array.isArray(error.error.message)) {
        errorMessage = error.error.message.join(', ');
      } else {
        errorMessage = error.error.message;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(() => new Error(errorMessage));
  }
}
