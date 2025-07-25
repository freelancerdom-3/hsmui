import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartStateService } from 'src/app/services/cart-state.service';
import { ServiceData } from 'src/app/services/cart-state.service';
import { Router } from '@angular/router';

import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

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

  //DEBOUNCE Subject for increment
  private incrementSubject = new Subject<ServiceData>();
  private incrementSubscription!: Subscription;

  //DEBOUNCE Subject for decrement
  private decrementSubject = new Subject<ServiceData>();
  private decrementSubscription!: Subscription;

  constructor(
    private cartStateService: CartStateService,
    private router: Router
  ) {}
  
  
  ngOnInit(): void {
    this.loadCartItems();
    
    this.cartStateService.serviceQuantityChanged$.subscribe(() => {
      this.loadCartItems();
    });

    // SET DEBOUNCE LOGIC
     this.incrementSubscription = this.incrementSubject.pipe(
      debounceTime(300)
    ).subscribe(service => {
      this._increment(service);
    });

    // SET DEBOUNCE LOGIC
    this.decrementSubscription = this.decrementSubject.pipe(
      debounceTime(300)
    ).subscribe(service => {
      this._decrement(service);
    });

  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['subCategoryIdFromSubCategoryComponent'] && this.subCategoryIdFromSubCategoryComponent !== undefined){
      this.loadCartItems();
    }
  }
  
  // FOR DEBOUNCE
  ngOnDestroy(): void {
    this.incrementSubscription.unsubscribe();
    this.decrementSubscription.unsubscribe();
  }
  

  loadCartItems(): void {
    this.serviceList = this.cartStateService.getServicesForSubCategory(this.subCategoryIdFromSubCategoryComponent);
  }

  // debounce for increment with PRIVATE
  increment(service: ServiceData): void {
    this.incrementSubject.next(service);
  }

  private _increment(service: ServiceData): void {
    console.log('➕ Increment triggered:', service.serviceId);
    this.cartStateService.addOrUpdateService(
      this.subCategoryIdFromSubCategoryComponent,
      '', // name optional
      '', // image optional
      service.serviceId,
      service.serviceName,
      service.price
    );
  }

  // debounce for decrement  with PRIVATE
 decrement(service: ServiceData): void {
    this.decrementSubject.next(service);
  }

  private _decrement(service: ServiceData): void {
    console.log('➖ Decrement triggered:', service.serviceId);
    this.cartStateService.removeService(this.subCategoryIdFromSubCategoryComponent, service.serviceId);
  }


  getTotalPrice(): number {
    return this.serviceList.reduce((total, s) => total + s.price * s.quantity, 0);
  }

  viewCart(): void {
    this.router.navigate(['cart']); // Adjust route as per your app
  }
}
