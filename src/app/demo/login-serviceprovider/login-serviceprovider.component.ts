import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BaseService } from 'src/app/services/base.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login-serviceprovider',
  imports: [CommonModule, RouterModule , ReactiveFormsModule],
  templateUrl: './login-serviceprovider.component.html',
  styleUrl: './login-serviceprovider.component.scss'
})
export class LoginServiceproviderComponent implements OnInit {

 signinForm: FormGroup;
  otpSent = false;
  errorMessage: string = '';
showPopup: boolean = false; // <-- control popup visibility



  constructor(private fb: FormBuilder, 
              private router: Router,
              private baseService: BaseService,
              private toastr: ToastrService
            ) {
              
    
  }

  ngOnInit(){
    this.signinForm = this.fb.group({
      //phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
       phoneNumber: ['', [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]]
     });

      // Live validation feedback
    this.signinForm.get('phoneNumber')?.valueChanges.subscribe(value => {
      const indianPattern = /^[6-9]\d{9}$/;

      // Only if length is 10 and invalid
      if (value && value.length === 10 && !indianPattern.test(value)) {
        console.log("Invalid mobile number:", value);
        this.toastr.error("Only valid Indian numbers allowed", "Invalid"); 
      }
    });
  }

  get phoneNumber() {
    return this.signinForm.get('phoneNumber');
  }



sendOtp(){
   const phoneNumber = this.signinForm.value.phoneNumber;
  this.baseService.GET<any>("https://localhost:7282/api/Otp/OtpForServiceProvider?mobileNumber=" + phoneNumber)
.subscribe(response => {
  console.log("Otp sent response: ", response);

  if (response?.message === "You are logged in as a user, so you can't use this number as a service provider.") {
          this.errorMessage = response.message;
          this.showPopup = true; // 🔥 SHOW POPUP!
        } else  {
          
          this.router.navigate(['/auth/verifyotp'], {
            queryParams: { phone: phoneNumber }
          });
        }
  
//  this.router.navigate(['/auth/verifyotp'], {
//       queryParams: { phone: phoneNumber }
//     });
  
});
 }




// sendOtp() {
//   const phoneNumber = this.signinForm.value.phoneNumber;

//   this.baseService.GET<any>("https://localhost:7282/api/Otp/OtpForServiceProvider?mobileNumber=" + phoneNumber)
//     .subscribe({
//       next: (response) => {
//         console.log("Otp sent response: ", response);

//         if (response?.message === "You are logged in as a user, so you can't use this number as a service provider.") {
//           this.errorMessage = response.message;
//           this.showPopup = true; // 🔥 SHOW POPUP!
//         } else if (response?.message === "User Paid 3") {
//           // Successful flow
//           this.router.navigate(['/auth/verifyotp'], {
//             queryParams: { phone: phoneNumber }
//           });
//         }
//       },
//       error: (error) => {
//         console.log('OTP error response:', error);
//         const msg = error.error?.message;

//         if (msg) {
//           this.errorMessage = msg;
//         } else {
//           this.errorMessage = "Failed to send OTP. Please try again later.";
//         }
//         this.showPopup = true; // 🔥 SHOW POPUP ON ANY ERROR
//       }
//     });
// }


    allowOnlyDigits(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  blockPaste(event: ClipboardEvent): void {
    const pastedInput: string = event.clipboardData?.getData('text') || '';
    const isValid = /^\d+$/.test(pastedInput);
    if (!isValid || pastedInput.length > 10) {
      event.preventDefault();
    }
  }


}
