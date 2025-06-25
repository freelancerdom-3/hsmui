import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-subcatagorycart',
  templateUrl: './subcatagorycart.component.html',
  styleUrls: ['./subcatagorycart.component.scss']
})
export class SubcatagorycartComponent implements OnInit {

  @Input() subCategoryIdFromSubCategoryComponent!: number;

  cartItems: any[] = [];
  filteredServiceList: any[] = [];
  quantities: { [key: number]: number } = {};

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadCartItems();
    this.displayServicesFromSubcategory();
  }

  loadCartItems() {
    // Replace this with localStorage logic later
    const storedCart = localStorage.getItem('cartItems');
    this.cartItems = storedCart ? JSON.parse(storedCart) : [
      {
        subCategoryId: 2,
        subcategoryName: 'Electrician',
        serviceList: [
          { serviceId: 3, ServiceName: "Fan replacement", SubCategoryId: 6, Price: 250, TimeTaken: "30 minutes" },
          { serviceId: 4, ServiceName: "fan installation", SubCategoryId: 6, Price: 200, TimeTaken: "20 minutes" }
          
        ]
      },
      {
        subCategoryId: 3,
        subcategoryName: 'Plumber',
        serviceList: [
          { serviceId: 3, ServiceName: "Bath fittings", SubCategoryId: 4, Price: 120, TimeTaken: "10 minutes" },
          { serviceId: 4, ServiceName: "Basin & sink", SubCategoryId: 4, Price: 300, TimeTaken: "20 minutes" }
        ]
      }
    ];
  }

  displayServicesFromSubcategory() {
    const subcategory = this.cartItems.find(item => item.subCategoryId === this.subCategoryIdFromSubCategoryComponent);
    this.filteredServiceList = subcategory ? subcategory.serviceList : [];

    // Initialize quantities
    this.filteredServiceList.forEach(service => {
      this.quantities[service.serviceId] = 1;
    });
  }

  increment(serviceId: number) {
    this.quantities[serviceId]++;
  }

  decrement(serviceId: number) {
    if (this.quantities[serviceId] > 1) {
      this.quantities[serviceId]--;
    }
  }

  getTotalPrice(): number {
    return this.filteredServiceList.reduce((total, service) => {
      const qty = this.quantities[service.serviceId] || 1;
      return total + (service.Price * qty);
    }, 0);
  }

  viewCart() {
    this.router.navigate(['/cart']);
  }
}
