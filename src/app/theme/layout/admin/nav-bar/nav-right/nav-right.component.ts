// angular import
import { Component, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

// bootstrap import
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-nav-right',
  imports: [SharedModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss'],
  providers: [NgbDropdownConfig]
})
export class NavRightComponent {
  // public props

  // constructor
  constructor(private router: Router,
              private toastr: ToastrService
  , private dataService: DataService) {
    const config = inject(NgbDropdownConfig);

    config.placement = 'bottom-right';
  }

 logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('mobileNumber');
  localStorage.removeItem('userTypeId');

  //remove these keys which will eventually redirect to dashboard
  localStorage.removeItem('route');
  localStorage.removeItem('subCategoryIdForRouting');


  this.toastr.success('Logout Successful!', 'Success', {
    timeOut: 3000,
    progressBar: true
  }); 

  localStorage.setItem('logoutMessage', 'Logged out successfully');
  console.log('Logout successful');

  localStorage.removeItem('cartId');

  this.dataService.setUserLoginStatus(false);
  this.router.navigate(['signin']);
}
  

  navigateToCart(){
    this.router.navigate(['cart']);
  }
}
