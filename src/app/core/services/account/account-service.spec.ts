import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { AccountService } from './account-service';
import { environment } from '../../../environments/environment.prod';

describe('AccountService', () => {
  let service: AccountService;
  let httpMock: HttpTestingController;

  const expectedUrl = `${environment.apiUrl}${environment.apiEndpoints.account}/delete`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AccountService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AccountService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('deleteAccount()', () => {
    const testEmail = 'nicole.smith@example.com';

    it('should send DELETE request to correct endpoint', () => {
      service.deleteAccount(testEmail).subscribe();

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.method).toBe('DELETE');

      req.flush(null, { status: 204, statusText: 'No Content' });
    });

    it('should send email in request body', () => {
      service.deleteAccount(testEmail).subscribe();

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.body).toEqual({ email: testEmail });

      req.flush(null, { status: 204, statusText: 'No Content' });
    });

    it('should complete successfully on 204 No Content', done => {
      service.deleteAccount(testEmail).subscribe({
        next: () => {},
        error: () => fail('Should not error'),
        complete: () => {
          expect(true).toBe(true);
          done();
        },
      });

      const req = httpMock.expectOne(expectedUrl);
      req.flush(null, { status: 204, statusText: 'No Content' });
    });

    it('should handle 200 OK response', () => {
      let completed = false;

      service.deleteAccount(testEmail).subscribe({
        complete: () => (completed = true),
      });

      const req = httpMock.expectOne(expectedUrl);
      req.flush({});

      expect(completed).toBeTrue();
    });

    it('should handle 403 Forbidden when user lacks permission', () => {
      let errorStatus = 0;

      service.deleteAccount(testEmail).subscribe({
        next: () => fail('Should have errored'),
        error: err => (errorStatus = err.status),
      });

      const req = httpMock.expectOne(expectedUrl);
      req.flush(
        { message: 'You can only delete your own account' },
        { status: 403, statusText: 'Forbidden' }
      );

      expect(errorStatus).toBe(403);
    });

    it('should handle 400 Bad Request for invalid email', () => {
      const invalidEmail = 'not-an-email';
      let errorResponse: HttpErrorResponse | undefined;

      service.deleteAccount(invalidEmail).subscribe({
        next: () => fail('Should have errored'),
        error: (err: HttpErrorResponse) => (errorResponse = err),
      });

      const req = httpMock.expectOne(expectedUrl);
      req.flush({ message: 'Invalid email format' }, { status: 400, statusText: 'Bad Request' });

      expect(errorResponse?.status).toBe(400);
      expect(errorResponse?.error.message).toBe('Invalid email format');
    });

    it('should handle 404 Not Found when account does not exist', () => {
      let errorStatus = 0;

      service.deleteAccount(testEmail).subscribe({
        next: () => fail('Should have errored'),
        error: err => (errorStatus = err.status),
      });

      const req = httpMock.expectOne(expectedUrl);
      req.flush({ message: 'Account not found' }, { status: 404, statusText: 'Not Found' });

      expect(errorStatus).toBe(404);
    });

    it('should handle 500 Internal Server Error', () => {
      let errorStatus = 0;

      service.deleteAccount(testEmail).subscribe({
        next: () => fail('Should have errored'),
        error: err => (errorStatus = err.status),
      });

      const req = httpMock.expectOne(expectedUrl);
      req.flush(
        { message: 'Database error' },
        { status: 500, statusText: 'Internal Server Error' }
      );

      expect(errorStatus).toBe(500);
    });

    it('should cancel request when unsubscribed', () => {
      const subscription = service.deleteAccount(testEmail).subscribe();

      const req = httpMock.expectOne(expectedUrl);
      subscription.unsubscribe();

      expect(req.cancelled).toBeTrue();
    });

    it('should handle network error', () => {
      let errorOccurred = false;

      service.deleteAccount(testEmail).subscribe({
        next: () => fail('Should have errored'),
        error: () => (errorOccurred = true),
      });

      const req = httpMock.expectOne(expectedUrl);
      req.error(new ProgressEvent('error'), {
        status: 0,
        statusText: 'Network error',
      });

      expect(errorOccurred).toBeTrue();
    });

    it('should handle empty email string', () => {
      service.deleteAccount('').subscribe();

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.body).toEqual({ email: '' });

      req.flush(null, { status: 204, statusText: 'No Content' });
    });

    it('should trim whitespace from email if needed', () => {
      const emailWithSpaces = '  test@example.com  ';

      // If your service should trim, adjust implementation and test accordingly
      service.deleteAccount(emailWithSpaces).subscribe();

      const req = httpMock.expectOne(expectedUrl);
      // Currently sends as-is; you might want to add .trim() in the service
      expect(req.request.body).toEqual({ email: emailWithSpaces });

      req.flush(null, { status: 204, statusText: 'No Content' });
    });

    it('should handle special characters in email', () => {
      const specialEmail = 'user+test@example.com';

      service.deleteAccount(specialEmail).subscribe();

      const req = httpMock.expectOne(expectedUrl);
      expect(req.request.body).toEqual({ email: specialEmail });

      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });
});
