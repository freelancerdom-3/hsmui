import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BaseService } from 'src/app/services/base.service';

@Component({
  selector: 'app-login-serviceprovider',
  imports: [CommonModule, RouterModule , ReactiveFormsModule],
  templateUrl: './login-serviceprovider.component.html',
  styleUrl: './login-serviceprovider.component.scss'
})
export class LoginServiceproviderComponent implements OnInit {

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

  // sendOtp() {
  //   const phoneNumber = this.signinForm.value.phoneNumber;
  //   // this.otpSent = true;
  //   console.log('Sending OTP to:', this.signinForm.value);
  //   //API call 
  //   this.baseService.GET<any>("https://localhost:7282/api/Otp/OtpForServiceProvider?mobileNumber="+phoneNumber)
  //   .subscribe(response => {
  //     console.log("Otp response : "+response);

  //     //  if (response?.isRegistered) {
  //     //   // ✅ Already registered
  //     //   this.router.navigate(['service-provider']);
  //     //  }
  //     //  else {
          
  //     //     this.router.navigate(['serviceprovider-registration'])
  //     //   }

  //   });

sendOtp(){
   const phoneNumber = this.signinForm.value.phoneNumber;
  this.baseService.GET<any>("https://localhost:7282/api/Otp/OtpForServiceProvider?mobileNumber=" + phoneNumber)
.subscribe(response => {
  console.log("Otp sent response: ", response);
  
 this.router.navigate(['/auth/verifyotp'], {
      queryParams: { phone: phoneNumber }
    });
  // Check skill registration (optional, not recommended at this stage)
  // this.baseService.GET<any>("https://localhost:7282/api/ServiceProviderSubCategoryMapping/IsSkillRegisteredByPhone?phone=" + phoneNumber)
  // .subscribe(skillRes => {
  //   if (skillRes.data === true) {
  //     this.router.navigate(['service-provider']);
  //   } else {
  //     this.router.navigate(['serviceprovider-registration']);
  //   }
  // });
});

    
   

    
  }
}
