import {
  ApplicationConfig,
  ErrorHandler,
  Injectable,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    const chunkFailedMessage = /Loading chunk [\d]+ failed/;

    if (error instanceof Error && chunkFailedMessage.test(error.message)) {
      window.location.reload();
      return; // Stop further execution after reload
    }

    console.error(error);
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
  ],
};
