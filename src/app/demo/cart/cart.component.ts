import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartStateService } from 'src/app/services/cart-state.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  standalone: true,
  imports: [CommonModule, SharedModule]
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];

  constructor(
    private router: Router,
    private cartStateService: CartStateService
  ) {}

  ngOnInit(): void {
    this.cartItems = this.cartStateService.getGroupedCartData();
    console.log("Grouped Cart Items: ", this.cartItems);
  }

  navigateToSubCategoryComponent(subCategoryId: number): void {
    //Set the respective subCategoryId and redirect to subCategory page
    localStorage.setItem('subCategoryIdFromClick', String(subCategoryId));
    this.router.navigate(['subcategory']);
  }

  navigateToDashboard(){
    this.router.navigate(['dashboard']);
  }

  checkout(subCategoryId: number) {
    console.log('Proceed to checkout for:', subCategoryId);
    localStorage.setItem('subCategoryIdFromCart', String(subCategoryId));
    this.router.navigate(['checkout']);
  }
}
