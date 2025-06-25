import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-cart',
  imports: [],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent{

constructor(private router: Router){}


  // cartItems: any[] = [];
   cartItems = [
  {
    subCategoryId: 2,
    subcategoryName: 'Electrician',
    serviceList: [
      {
        serviceId: 3,
        ServiceName: "Fan replacement",
        SubCategoryId: 6,
        Price: 250,
        TimeTaken: "30 minutes"
      },
      {
        serviceId: 4,
        ServiceName: "fan installation",
        SubCategoryId: 6,
        Price: 200,
        TimeTaken: "20 minutes"
      }
    ]
  },
  {
    subCategoryId: 3,
    subcategoryName: 'Plumber',
    serviceList: [
      {
        serviceId: 3,
        ServiceName: "Bath fittings",
        SubCategoryId: 4,
        Price: 120,
        TimeTaken: "10 minutes"
      },
      {
        serviceId: 4,
        ServiceName: "Basin & sink",
        SubCategoryId: 4,
        Price: 300,
        TimeTaken: "20 minutes"
      }
    ]
  },
  {
     subCategoryId: 1,
    subcategoryName: 'Beauty',
    serviceList: [
      {
        serviceId: 10,
        ServiceName: "Sallon for man",
        SubCategoryId: 7,
        Price: 120,
        TimeTaken: "10 minutes"
      },
      {
        serviceId: 11,
        ServiceName: "massage",
        SubCategoryId: 7,
        Price: 300,
        TimeTaken: "20 minutes"
      }
    ]
  }
];
      
  
 navigateTodashboard(): void{
    this.router.navigate(['dashboard']);
  }

  checkout(item: any) {
  console.log('Proceed to checkout for:', item.subcategoryName);
  
}
}
