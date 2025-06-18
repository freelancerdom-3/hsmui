import { HttpClient } from '@angular/common/http';
import { Component , OnInit } from '@angular/core';
import { RouterModule , ActivatedRoute, Router} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from 'src/app/demo/dashboard/dashboard.component';

@Component({
  selector: 'app-verifyotp',
  imports: [ RouterModule, FormsModule,CommonModule],
  standalone: true,
  templateUrl: './verifyotp.component.html',
  styleUrl: './verifyotp.component.scss'
})
export class VerifyotpComponent implements OnInit {
    phoneNumber: string | null = null;
  	otp: string = '';

  constructor(
    private route: ActivatedRoute,
    private router:Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.phoneNumber = this.route.snapshot.queryParamMap.get('phone');
    console.log('Phone number received:', this.phoneNumber);
  }

  verifyOtp(): void {
    if (!this.phoneNumber) {
      alert('Phone number not found.');
      return;
    }
      console.log("verify phonenumber : "+ this.phoneNumber);
      console.log("verify otp : "+ this.otp);

    const apiUrl = 'https://localhost:7282/api/Otp/Verify?Otp=' +this.otp + '&mobileNumber=' +this.phoneNumber ; 
    
    this.http.get(apiUrl).subscribe({
      next: (response: any) => {
        console.log('OTP verify response:', response);

        if (response.data == null) {
			console.log(" data is null "+response.message);
        
        } else {
			console.log("data "+response.message);
			this.router.navigate(['dashboard'])
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



//   verifyOtp(): void {
//     if (this.otp === '123456') {
//     console.log('otp verified . Navigating to dashboard');
//     this.router.navigateByUrl('/dashboard');
//   }else {
//     alert('Invalid OTP'); 
//   }
// }

 

