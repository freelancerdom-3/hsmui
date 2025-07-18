import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseService } from 'src/app/services/base.service';
import { ToastrService } from 'ngx-toastr';
import { DataService } from 'src/app/services/data.service';
import { CartStateService } from 'src/app/services/cart-state.service';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Component({
  selector: 'app-verifyotp',
  standalone: true,
  imports: [RouterModule, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './verifyotp.component.html',
  styleUrls: ['./verifyotp.component.scss']
})
export class VerifyotpComponent implements OnInit {
  otpForm!: FormGroup;
  phoneNumber: string | null = null;
  otpError: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private baseService: BaseService,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private dataService: DataService,
    private cartStateService: CartStateService
  ) {}

  ngOnInit(): void {
    this.phoneNumber = this.route.snapshot.queryParamMap.get('phone');
    console.log('Phone number received:', this.phoneNumber);

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
    });
  }

  get otpControl() {
    return this.otpForm.get('otp');
  }

  verifyOtp(): void {
    this.otpError = false;

    if (!this.phoneNumber) {
      alert('Phone number not found.');
      return;
    }

    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    const otp = this.otpControl?.value;
    const apiUrl = `https://localhost:7282/api/Otp/Verify?Otp=${otp}&mobileNumber=${this.phoneNumber}`;

    this.baseService.GET<any>(apiUrl).subscribe({
      next: (response: any) => {
        console.log('OTP verify response:', response);

        if (!response.data) {
          console.warn("Data is null:", response.message);
          this.toastr.error('Invalid OTP or user not found');
          return;
        }

        const { jwtToken, userId, mobileNumber, userTypeId } = response.data;

        localStorage.setItem('authToken', jwtToken);
        localStorage.setItem('userId', userId.toString());
        localStorage.setItem('mobileNumber', mobileNumber);
        localStorage.setItem('userTypeId', userTypeId.toString());

        if (userTypeId === 2) {
          this.getCartForEndUserAndSaveToLocalStorage(userId).pipe(
            tap(cartId => {
              console.log("Cart ID received:", cartId);
              this.dataService.setUserLoginStatus(true);
              console.log("User logged in");
            }),
            tap(() => {
              const dynamicRoute = localStorage.getItem('route');
              const subCategoryId = localStorage.getItem('subCategoryIdForRouting');

              if (dynamicRoute && subCategoryId) {
                localStorage.setItem('subCategoryIdFromClick', subCategoryId);
                localStorage.setItem('subCategoryIdFromCart', subCategoryId);
                this.router.navigate([dynamicRoute]);
              } else {
                this.router.navigate(['dashboard']);
              }
            })
          ).subscribe();

        } else if (userTypeId === 3) {
          this.checkServiceProviderSkills(userId);
        }
      },
      error: (err) => {
        console.error('OTP verification failed:', err);
        this.toastr.error('Server error: ' + err.message);
      }
    });
  }

  getCartForEndUserAndSaveToLocalStorage(userId: number): Observable<number> {
    return this.baseService.GET<any>(`https://localhost:7282/api/Cart/GenerateCart?userId=${userId}`).pipe(
      tap(response => {
        const cartId = response?.data?.cartId;
        if (cartId) {
          localStorage.setItem('cartId', cartId.toString());
        } else {
          console.error("Cart ID not found", response);
          throw new Error("Cart ID is null");
        }
      }),
      map(response => response.data.cartId)
    );
  }

  checkServiceProviderSkills(userId: number): void {
    const apiUrl = `https://localhost:7282/api/ServiceProviderSubCategoryMapping/HasSkills?userId=${userId}`;

    this.baseService.GET<any>(apiUrl).subscribe({
      next: (res) => {
        const hasSkills = res.data === true;
        this.router.navigate([hasSkills ? 'service-provider' : 'serviceprovider-registration']);
      },
      error: (err) => {
        console.error('Skill check failed:', err);
        this.toastr.error('Error while checking skill registration.');
      }
    });
  }

  resendOtp(): void {
    if (!this.phoneNumber) return;

    const apiUrl = `https://localhost:7282/api/Otp/OtpForEndUser?mobilenumber=${this.phoneNumber}`;
    this.http.get(apiUrl).subscribe({
      next: (response) => {
        console.log("OTP resent:", response);
        this.toastr.success('OTP has been resent.');
      },
      error: (err) => {
        console.error("Error resending OTP:", err);
        this.toastr.error('Failed to resend OTP.');
      }
    });
  }

  allowOnlyDigits(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  blockPaste(event: ClipboardEvent): void {
    const pastedInput = event.clipboardData?.getData('text') || '';
    const isValid = /^\d+$/.test(pastedInput);
    if (!isValid || pastedInput.length > 6) {
      event.preventDefault();
    }
  }
}
