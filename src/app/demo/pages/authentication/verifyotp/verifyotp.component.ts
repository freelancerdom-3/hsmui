import { HttpClient } from '@angular/common/http';
import { Component , OnInit } from '@angular/core';
import { RouterModule , ActivatedRoute, Router} from '@angular/router';
import { FormsModule , ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from 'src/app/demo/dashboard/dashboard.component';
import { BaseService } from 'src/app/services/base.service';
import { ToastrService } from 'ngx-toastr';

import { DataService } from 'src/app/services/data.service';
import { CartStateService } from 'src/app/services/cart-state.service';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Component({
  selector: 'app-verifyotp',
  imports: [ RouterModule, FormsModule,ReactiveFormsModule,CommonModule],
  standalone: true,
  templateUrl: './verifyotp.component.html',
  styleUrl: './verifyotp.component.scss'
})
export class VerifyotpComponent implements OnInit {
    otpForm!: FormGroup;
    phoneNumber: string | null = null;
    otpError: boolean = false; 

  constructor(
    private route: ActivatedRoute,
    private router:Router,
    private http: HttpClient,
    private baseService: BaseService,
    private toastr: ToastrService ,
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
      // console.log("verify phonenumber : "+ this.phoneNumber);
      // console.log("verify otp : "+ this.otp);
      console.log('Verifying OTP:', otp, 'Phone:', this.phoneNumber);
    
      // const apiUrl = 'https://localhost:7282/api/Otp/Verify?Otp=' +this.otp + '&mobileNumber=' +this.phoneNumber ; 
       const apiUrl = `https://localhost:7282/api/Otp/Verify?Otp=${otp}&mobileNumber=${this.phoneNumber}`;

    this.baseService.GET<any>(apiUrl).subscribe({
      next: (response: any) => {
        console.log('OTP verify response:', response);
        
        if (response.data == null) {
          console.log(" data is null "+response.message);
        } 
        else {
            console.log("data "+response.message); 
            console.log("jwtToken:", response.data.jwtToken);
            
            localStorage.setItem('authToken', response.data.jwtToken.toString());
            localStorage.setItem('userId', response.data.userId.toString());
            localStorage.setItem('mobileNumber', response.data.mobileNumber.toString());
            localStorage.setItem('userTypeId', response.data.userTypeId.toString());
          
          if (response.data.userTypeId === 2) {
            /* This pipe tap logic will ensure the sequential execution of this entire flow
            */
            this.getCartForEndUserAndSaveToLocalStorage(response.data.userId).pipe(
              tap(cartId => {
                // side-effect: after cart is created
                console.log("Cart fetched from backend in verifyotp file cartId : "+cartId);
                this.dataService.setUserLoginStatus(true);
                console.log("User logged in userLogin status turned true");
              }),
              tap(() => {
                // another side-effect: routing
                  if (localStorage.getItem('route') && localStorage.getItem('subCategoryIdForRouting')) {
                    const dynamicRoute = localStorage.getItem('route');
                    const routingSubCategoryId = localStorage.getItem('subCategoryIdForRouting');

                    localStorage.setItem('subCategoryIdFromClick', routingSubCategoryId);
                    localStorage.setItem('subCategoryIdFromCart', routingSubCategoryId);
                    this.router.navigate([dynamicRoute]);
                  } else {
                    this.router.navigate(['dashboard']);
                  }
                }
              ),
              catchError(err => {
                //Catch any of the errors if anything goes wrong
                console.error('Cart fetch failed', err);
                return of(null);
              })
            ).subscribe();
          }

          /* Toastr logic to show messages on UI
          */
          this.toastr.success('Login Successful!', 'Success', {
            timeOut: 3000,
            progressBar: true
          });
          localStorage.setItem('loginSuccessMessage', 'Logged in successfully');
          console.log('Login Successful');  
        }
      },
      error: (err) => {
        console.error('OTP verification failed:', err);
        alert('Server error' + err.message);
      }
    });
  }

  //This function will get cart from backend and save it to localStorage
  /* Here I have used pipe and tap logic for maitainig sequential execution as tap's side effect
  property helps to achieve it and once the subscribe is called then the whole flow is ensured 
  to work in the defined execution sequence.
  */
  getCartForEndUserAndSaveToLocalStorage(userId: number): Observable<number> {
    return this.baseService.GET<any>(`https://localhost:7282/api/Cart/GenerateCart?userId=${userId}`).pipe(
      tap(response => {
        if (response?.data?.cartId != null) {
          localStorage.setItem('cartId', String(response.data.cartId));
          console.log("CartId from verify otp:", response.data.cartId);
        } else {
          console.error("❌ cartId not found in response", response);
          throw new Error("CartId is null");
        }
      }),
      map(response => response.data.cartId)
    );
  }



  resendOtp(): void {
    console.log("otp resent : " +this.phoneNumber);

    const apiUrl = "https://localhost:7282/api/Otp/OtpForEndUser?mobilenumber="+this.phoneNumber
    this.http.get(apiUrl).subscribe(response => {
        console.log("Otp response : "+response);
    });
  }

  allowOnlyDigits(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  blockPaste(event: ClipboardEvent): void {
    const pastedInput: string = event.clipboardData?.getData('text') || '';
    const isValid = /^\d+$/.test(pastedInput);
    if (!isValid || pastedInput.length > 6) {
      event.preventDefault();
    }
  }
}

