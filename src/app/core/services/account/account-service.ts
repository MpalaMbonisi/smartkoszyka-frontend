import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}${environment.apiEndpoints.account}`;

  /**
   * Deletes the user account by sending the email in the request body
   * @param email The email of the account to delete
   * @returns Observable that completes on success (204) or errors on failure
   */
  deleteAccount(email: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete`, {
      body: { email },
    });
  }
}
