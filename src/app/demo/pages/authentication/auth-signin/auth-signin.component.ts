import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder , FormGroup , Validators ,ReactiveFormsModule } from '@angular/forms';
import { Router,RouterModule } from '@angular/router';
import { BaseService } from 'src/app/services/base.service';


@Component({
  selector: 'app-auth-signin',
  standalone: true,
  imports: [CommonModule, RouterModule , ReactiveFormsModule],
  templateUrl: './auth-signin.component.html',
  styleUrls: ['./auth-signin.component.scss']
})
export default class AuthSigninComponent implements OnInit {
  signinForm: FormGroup;
  otpSent = false;

  constructor(private fb: FormBuilder, 
              private router: Router,
              private baseService: BaseService
            ) {
    
  }

  ngOnInit(){
    this.signinForm = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
    });
  }

  get phoneNumber() {
    return this.signinForm.get('phoneNumber');
  }

  sendOtp() {
    const phoneNumber = this.signinForm.value.phoneNumber;
    // this.otpSent = true;
    console.log('Sending OTP to:', this.signinForm.value);
    //API call 
    this.baseService.GET<any>("https://localhost:7282/api/Otp/OtpForEndUser?mobilenumber="+phoneNumber)
    .subscribe(response => {
      console.log("Otp response : "+response);
    });

    
    this.router.navigate(['/auth/verifyotp'], {
      queryParams: { phone: phoneNumber }
    });
  }
}