import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TimeslotComponent, TimeslotState } from '../timeslot/timeslot.component';
import { BaseService } from 'src/app/services/base.service';
import { CartStateService, ServiceData } from 'src/app/services/cart-state.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilityService } from 'src/app/services/utility.service';

interface CartItem {
  id : number;
  name: string;
  quantity: number;
  price: number;
}

interface Fees{
  // FeesId : number;
  startRange : number;
  endRange : number;
  charge : number;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, TimeslotComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  Fees: Fees[] = [];

  constructor(private baseService: BaseService, private cartStateService: CartStateService, private router: Router, private activatedRoute: ActivatedRoute, private utilityService: UtilityService){}
  
  //services list
  serviceList: any[] = [];

  subCategoryIdFromCart: number;

  userLoginStatus = true;

  ngOnInit(): void {
    this.getfees();

    //fetch subCategoryId from localstorage to load services of respective subCategoryId
    this.subCategoryIdFromCart = Number(localStorage.getItem('subCategoryIdFromCart'));
    
    this.cartStateService.serviceQuantityChanged$.subscribe(() => {
      this.loadCartItems();
    });
    console.log("Cart items of subCategoryId : "+this.serviceList);

    //check user login status
    this.checkUserLoginStatus();
  }
  /* ------------------- customer + cart --------------------- */
  customer = {
    phone: '',
    address: '',
    timeslot: '',
    paymentMethod: 'cod'
  };


  //deliveryCharge = 40;

  //navigate to signin page
  onLoginClicked(){
    //get current page url
    const url = this.router.url;
    const urlEndpointToRedirectBack = this.utilityService.extractLastSegment(url);
    console.log("Url end point : "+this.utilityService.extractLastSegment(this.router.url));
    localStorage.setItem('route', urlEndpointToRedirectBack);
    localStorage.setItem('subCategoryIdForRouting', String(this.subCategoryIdFromCart));
    this.router.navigate(['signin']);
  }

  checkUserLoginStatus(){
    if(!localStorage.getItem('userId')){
      this.userLoginStatus = false;
    }
  }

  //load cartItems from cart-state service
  loadCartItems(): void {
    this.serviceList = this.cartStateService.getServicesForSubCategory(this.subCategoryIdFromCart);
  }

  /* ------------------- popup helpers ------------------------ */
  showTimeSlotPopup = false;
  selectedSlot?: TimeslotState;   // remembers last pick for “Edit”

  openTimeSlotPopup(): void { this.showTimeSlotPopup = true; }

  closeTimeSlotPopup(): void { this.showTimeSlotPopup = false; }

  onSlotSelected(state: TimeslotState): void {
    /** state = { date: '2025-07-01', time: '01:00 PM' } */
    const pretty = new Date(state.date).toLocaleDateString('en-US', {
      weekday: 'short', day: '2-digit', month: 'short'
    });
    this.customer.timeslot = `${pretty} • ${state.time}`;
    this.selectedSlot      = state;
    this.showTimeSlotPopup = false;
  }

  /* ------------------- helpers ------------------------------ */

  getfees() : void{
		this.baseService.GET<any>("https://localhost:7282/api/Fees").subscribe(Response=>{
      this.Fees = Response.data;
      console.log(this.Fees);
    })
	}

  getSubtotal(): number {
    return this.serviceList.reduce((sum, item) => sum + item.quantity * item.price, 0);
  }

  /** Dynamic Taxes & Fees based on slab table */
  getTaxesAndFees(): number {
    const subtotal = this.getSubtotal();
    console.log(this.Fees);
    const slab = this.Fees.find(f => subtotal >= f.startRange && subtotal <= f.endRange);
    if (!slab) return 0;                          // no slab matched
    return +(subtotal * slab.charge / 100).toFixed(2);  // round to 2 dec
  }

  /** Grand total */
  getGrandTotal(): number {
    return this.getSubtotal() + this.getTaxesAndFees();
  }
  
  increment(service: ServiceData): void {
      this.cartStateService.addOrUpdateService(
        this.subCategoryIdFromCart,
        '', // name optional
        '', // image optional
        service.serviceId,
        service.serviceName,
        service.price
      );
    }
  
    decrement(service: ServiceData): void {
      this.cartStateService.removeService(this.subCategoryIdFromCart, service.serviceId);
    }


  placeOrder(): void {
    if (!this.customer.timeslot) {
      alert('Please select a time slot first.');
      return;
    }
    console.log('Order placed!', this.customer, this.serviceList);
    alert('Thank you! Your order has been placed.');
  }
}
