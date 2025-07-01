import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartStateService } from 'src/app/services/cart-state.service';
import { ServiceData } from 'src/app/services/cart-state.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-subcatagorycart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subcatagorycart.component.html',
  styleUrls: ['./subcatagorycart.component.scss']
})
export class SubcatagorycartComponent implements OnInit, OnChanges {

  @Input() subCategoryIdFromSubCategoryComponent!: number; // will be passed by parent component
  serviceList: ServiceData[] = [];

  constructor(
    private cartStateService: CartStateService,
    private router: Router
  ) {}
  
  
  ngOnInit(): void {
    this.loadCartItems();
    
    this.cartStateService.serviceQuantityChanged$.subscribe(() => {
      this.loadCartItems();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['subCategoryIdFromSubCategoryComponent'] && this.subCategoryIdFromSubCategoryComponent !== undefined){
      this.loadCartItems();
    }
  }

  

  loadCartItems(): void {
    this.serviceList = this.cartStateService.getServicesForSubCategory(this.subCategoryIdFromSubCategoryComponent);
  }

  increment(service: ServiceData): void {
    this.cartStateService.addOrUpdateService(
      this.subCategoryIdFromSubCategoryComponent,
      '', // name optional
      '', // image optional
      service.serviceId,
      service.serviceName,
      service.price
    );
  }

  decrement(service: ServiceData): void {
    this.cartStateService.removeService(this.subCategoryIdFromSubCategoryComponent, service.serviceId);
  }

  getTotalPrice(): number {
    return this.serviceList.reduce((total, s) => total + s.price * s.quantity, 0);
  }

  viewCart(): void {
    this.router.navigate(['cart']); // Adjust route as per your app
  }
}
