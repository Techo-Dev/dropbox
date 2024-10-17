// src/app/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LoginResponse } from './models/login-response.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private loginUrl = 'http://localhost:3000/login'; // Update with your backend login API

  constructor(private http: HttpClient) {}

  login(userName: string, userPassword: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.loginUrl, { email: userName, password: userPassword }).pipe(
      tap((response: LoginResponse) => {
        if (response && response.token) {
          localStorage.setItem('authToken', response.token);
        }
      }),
      catchError(this.handleError)
    );
  }

  logout(): void {
    localStorage.removeItem('authToken');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('authToken');
  }

  private handleError(error: HttpErrorResponse) {
    let errorMsg = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side/network error
      errorMsg = `A client-side error occurred: ${error.error.message}`;
    } else {
      // Backend returned unsuccessful response code
      errorMsg = `Backend returned code ${error.status}, body was: ${error.error}`;
    }
    console.error(errorMsg);
    return throwError(() => new Error(errorMsg));
  }
}
