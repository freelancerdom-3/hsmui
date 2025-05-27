
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BaseService } from 'src/app/services/base.service';
import { AppConstant } from 'src/app/demo/baseservice/baseservice.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-signin',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './auth-signin.component.html',
  styleUrls: ['./auth-signin.component.scss']
})
export default class AuthSigninComponent {
  constructor(private baseService: BaseService, private router: Router, private toastr: ToastrService) { }
  MenuPermissionList: any[] = [];
  isOtpScreen: boolean = false;
  email: string = '';
  password: string = '';
  objlogin: any;
  URL = AppConstant.url
  otp: string = '';


  timer: number = 180;
  showResend: boolean = false;
  intervalId: any;


  onNext() {
    if (!this.email || !this.password) {
      this.toastr.warning('Please enter email and password.');
      return;
    }

    const apiurl = this.URL + `TblUser/ValidateCredential?email=${this.email}&password=${this.password}`;

    this.baseService.GET<any>(apiurl).subscribe(response => {
      if (response?.data && response.statusCode === 200) {
        this.objlogin = response.data;
        localStorage.setItem('data', JSON.stringify(this.objlogin));

        const userId = this.objlogin?.userId;
        const otpUrl = `https://localhost:7272/api/TblOTP/GenerateOtp?userId=${userId}`;

        // this.baseService.GET<any>(otpUrl).subscribe(otpResponse => {
        //   if (otpResponse.statusCode === 200) {
        //     this.toastr.success(otpResponse.message, 'OTP Sent');
        //     this.isOtpScreen = true;
        //     this.startTimer();
        //   } else {
        //     this.toastr.error(otpResponse.message || 'Failed to send OTP');
        //   }
        // }, error => {
        //   this.toastr.error('OTP API error');
        //   console.error('OTP Error:', error);
        // });

        this.baseService.GET<any>(otpUrl).subscribe(otpResponse => {
  if (otpResponse.statusCode === 200) {
    const otpCode = otpResponse.data?.otpCode || '';
    const emailOtpPayload = {
      ToEmail: this.email,
      Otp: otpCode
    };

    this.baseService.POST<any>('https://localhost:7272/api/TblOTP/EmailOtpToUser', emailOtpPayload).subscribe(() => {
      this.toastr.success(otpResponse.message, 'OTP sent to email');
      this.isOtpScreen = true;
      this.startTimer();
    }, err => {
      this.toastr.warning('OTP generated but failed to email');
      this.isOtpScreen = true;
      this.startTimer();
    });

  } else {
    this.toastr.error(otpResponse.message || 'Failed to generate OTP');
  }
}, error => {
  this.toastr.error('OTP API error');
  console.error('OTP Error:', error);
});

      } else {
        this.toastr.error(response.message, 'Invalid credentials');
      }
    }, error => {
      this.toastr.error('Login API error');
      console.error('Login Error:', error);
    });
  }


  startTimer() {
    this.timer = 180;
    this.showResend = false;

    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      this.timer--;
      if (this.timer === 0) {
        clearInterval(this.intervalId);
        this.showResend = true;
      }
    }, 1000);
  }


  onResendOtp() {
    const userId = this.objlogin?.userId;
    const otpUrl = `https://localhost:7272/api/TblOTP/GenerateOtp?userId=${userId}`;
    this.baseService.GET<any>(otpUrl).subscribe(otpResponse => {
      if (otpResponse.statusCode === 200) {
        this.toastr.success('OTP resent successfully');
        this.startTimer(); // Restart timer
      } else {
        this.toastr.error('Failed to resend OTP');
      }
    }, error => {
      this.toastr.error('Resend OTP API error');
      console.error('Resend OTP Error:', error);
    });
  }

  OnLogin() {
    if (!this.otp) {
      this.toastr.warning('Please enter OTP.');
      return;
    }

    const validateUserUrl = this.URL + `TblUser/ValidateCredential?email=${this.email}&password=${this.password}`;

    this.baseService.GET<any>(validateUserUrl).subscribe(userResponse => {
      if (userResponse?.data && userResponse.statusCode === 200) {
        const userId = userResponse.data.userId;
        const verifyOtpUrl = `https://localhost:7272/api/TblOTP/VerifyOtp?userId=${userId}&otpCode=${this.otp}`;

        // Verify OTP using POST
        this.baseService.GET<any>(verifyOtpUrl).subscribe(otpResponse => {
          if (otpResponse.statusCode === 200) {
            // OTP verified successfully
           const loginData = otpResponse.data;
             localStorage.setItem('authToken', userResponse.data.token);
          localStorage.setItem('userData', JSON.stringify({
            userId: userResponse.data.userId,
            userName: userResponse.data.userName,
            roleId: userResponse.data.roleId,
            profileImage: userResponse.data.profileImage
          }));
  this.toastr.success('Login successful!');
  this.getMenuPermissionList();
  this.router.navigate(['/dashboard']);


          } else {
            // OTP verification failed
            this.toastr.error(otpResponse.message || 'Invalid OTP');
          }
        }, otpError => {
          this.toastr.error('OTP Verification failed');
          console.error('OTP Error:', otpError);
        });

      } else {
        // User validation failed
        this.toastr.error(userResponse.message || 'Invalid email or password');
      }
    }, error => {
      this.toastr.error('Login API error');
      console.error('Login Error:', error);

    });



  }

  getMenuPermissionList() {

    const userData = localStorage.getItem('data');
    const parsedData = userData ? JSON.parse(userData) : null;
    const roleId = parsedData?.roleid;

    this.baseService.GET<any>(`${this.URL}TblMenuPermission/GetAll?roleId=${roleId}`)
      .subscribe(response => {
        this.MenuPermissionList = response.data || [];
        localStorage.setItem('MenuPermission', JSON.stringify(response?.data));
        this.router.navigate(['/dashboard']);
        console.log("Menu permissions stored in localStorage:", response?.data);
      });
  }

  onCancel() {
    this.isOtpScreen = false;
    this.otp = '';
  }

  get timerDisplay(): string {
    const mins = Math.floor(this.timer / 60);
    const secs = this.timer % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
}
