import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class BaseService {
  constructor(private http: HttpClient,
     private toastr: ToastrService,
     private router: Router
    ) {}

  // ✅ Add Authorization Header if token exists
  private getAuthHeaders(): HttpHeaders {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      return new HttpHeaders().set('Authorization', `Bearer ${authToken}`);
    }
    return new HttpHeaders();
  }

  // ✅ Centralized Error Handler with Toast
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = '';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server error ${error.status}: ${error.message}`;
    }

    // ✅ Show toast notification
    this.toastr.error(errorMessage, 'API Error', {
      timeOut: 4000,
      progressBar: true,
    });

     console.error('HTTP Error:', error);

    // if (error.status === 401) {
    //     setTimeout(() => {
    //     this.router.navigate(['signin']); // Redirect to signin
    //   }, 1000); // Add slight delay so toast is visible
    // }

    return throwError(() => new Error(errorMessage));
  }

  // ✅ HTTP Methods with error handling
  POST<T>(url: string, body: any): Observable<T> {
    const headers = this.getAuthHeaders();
    return this.http.post<T>(url, body, { headers }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  GET<T>(url: string): Observable<T> {
    const headers = this.getAuthHeaders();
    return this.http.get<T>(url, { headers }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  PUT<T>(url: string, body: any): Observable<T> {
    const headers = this.getAuthHeaders();
    return this.http.put<T>(url, body, { headers }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  DELETE<T>(url: string, body: any): Observable<T> {
    const headers = this.getAuthHeaders();
    return this.http.delete<T>(url, { headers }).pipe(
      catchError(error => this.handleError(error))
    );
  }
}
