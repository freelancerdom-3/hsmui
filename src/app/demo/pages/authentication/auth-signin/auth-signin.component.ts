import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder , FormGroup , Validators ,ReactiveFormsModule } from '@angular/forms';
import { Router,RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BaseService } from 'src/app/services/base.service';

import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';



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

  private sendOtpSubject = new Subject<void>(); //Subject for debounce


  constructor(private fb: FormBuilder, 
              private router: Router,
              private baseService: BaseService,
              private toastr: ToastrService
               ) {
    
  }

  ngOnInit(){
    this.signinForm = this.fb.group({
     // phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
     phoneNumber: ['', [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]]
    });

     // Debounce send OTP logic
      this.sendOtpSubject.pipe(
      debounceTime(500)
      ).subscribe(() => {
        this._sendOtp(); 
      });

     // Live validation feedback
    this.signinForm.get('phoneNumber')?.valueChanges.subscribe(value => {
      const indianPattern = /^[6-9]\d{9}$/;

      // Only if length is 10 and invalid
      if (value && value.length === 10 && !indianPattern.test(value)) {
        console.log("Invalid mobile number:", value);
        this.toastr.error("Not a valid Indian Mobile number ", "Invalid"); 
      }
    });
  }

  get phoneNumber() {
    return this.signinForm.get('phoneNumber');
    }

    //Debounce call
    sendOtp(): void {
      console.log("Send OTP clicked");
      this.sendOtpSubject.next(); 
    }

  private _sendOtp() {
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