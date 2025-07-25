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
    /*I had to change the DELETE mehod's implementation as http.delete does not 
    provide direct way to pass body as content so there is a carrier named options
    which is the defualt option just like in switch case one so this is capable of 
    carrying some paylod like object with it and as I am passing this options object like I have named 
    it as options so it can infer to the name options in terms of http method so I am passing headers 
    with it and the ASP.NET core backend will recognize it even in the options way.
    */
    const headers = this.getAuthHeaders();
    const options = {
      headers: headers,
      body: body
    }
    return this.http.delete<T>(url, options).pipe(
      catchError(error => this.handleError(error))
    );
  }
}
