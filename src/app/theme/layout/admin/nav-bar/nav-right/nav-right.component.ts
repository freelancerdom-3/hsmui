// angular import
import { Component, inject } from '@angular/core';


// bootstrap import
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { Router } from '@angular/router';

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
  constructor(private router: Router) {
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
  this.router.navigate(['signin']);
}
  

  navigateToCart(){
    this.router.navigate(['cart']);
  }
}
