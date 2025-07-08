import { HttpClient } from '@angular/common/http';
import { Component , OnInit } from '@angular/core';
import { RouterModule , ActivatedRoute, Router} from '@angular/router';
import { FormsModule , ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from 'src/app/demo/dashboard/dashboard.component';
import { BaseService } from 'src/app/services/base.service';
import { ToastrService } from 'ngx-toastr';


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
    private fb: FormBuilder
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
          
          if(localStorage.getItem('route') && localStorage.getItem('subCategoryIdForRouting')){
            const dynamicRoute = localStorage.getItem('route');
            const routingSubCategoryId = localStorage.getItem('subCategoryIdForRouting');

            /*set subCategoryIdFromClick and subCategoryIdFromCart with routing subcategoryId so that no matter 
            where the user is, one can be redirected to exact page
            */
            localStorage.setItem('subCategoryIdFromClick', routingSubCategoryId);
            localStorage.setItem('subCategoryIdFromCart', routingSubCategoryId);
            this.router.navigate([dynamicRoute]);
          }
          else{
            this.router.navigate(['dashboard']);
          }
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

  resendOtp(): void {
  console.log("otp resent : " +this.phoneNumber);

  const apiUrl = "https://localhost:7282/api/Otp/OtpForEndUser?mobilenumber="+this.phoneNumber
  this.http.get(apiUrl).subscribe(response => {
      console.log("Otp response : "+response);
    });
  }
}
