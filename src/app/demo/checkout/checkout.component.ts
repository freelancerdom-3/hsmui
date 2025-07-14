import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TimeslotComponent, TimeslotState } from '../timeslot/timeslot.component';
import { BaseService } from 'src/app/services/base.service';
import { CartStateService, ServiceData } from 'src/app/services/cart-state.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilityService } from 'src/app/services/utility.service';

interface CartItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

interface Fees {
  // FeesId : number;
  startRange: number;
  endRange: number;
  charge: number;
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

  constructor(private baseService: BaseService, 
              private cartStateService: CartStateService, 
              private router: Router, 
              private activatedRoute: ActivatedRoute, 
              private utilityService: UtilityService
              )
              {}
  
  //services list
  serviceList: any[] = [];

  subCategoryIdFromCart: number;

  userLoginStatus = true;

  /* ------------ user object to enable two-way binding and setting of data--------------*/
  user = {
    userId: '',
    Mobilenumber: '',
    houseNumber: '',
    landmark: '',
    ariaName: '',
    locationTypeId: 1,
    customLabel: ''
  };
  //----Address pop-up flag
  showAddressPopup = false;

  //userId and mobileNumber for address API
  userId: string;
  mobileNumber: string;

  searchRegion: any[] = [];
  selectedRegionData: any = null;

  ngOnInit(): void {
    //Fetch fees from backend and load to array
    this.getfees();

    //fetch subCategoryId from localstorage to load services of respective subCategoryId
    this.subCategoryIdFromCart = Number(localStorage.getItem('subCategoryIdFromCart'));
    //Trigger that updates the cart items
    this.cartStateService.serviceQuantityChanged$.subscribe(() => {
      this.loadCartItems();
    });
    console.log("Cart items of subCategoryId : " + this.serviceList);

    //check user login status
    this.checkUserLoginStatus();

    //check if the user logs in then load userId and mobile number
    if(this.userLoginStatus){
      this.loadUserIdAndMobileNumberIfUserIsLoggedIn();
      this.loadUserDetails();
    }

    
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
  onLoginClicked() {
    //get current page url
    const url = this.router.url;
    const urlEndpointToRedirectBack = this.utilityService.extractLastSegment(url);
    console.log("Url end point : " + this.utilityService.extractLastSegment(this.router.url));
    localStorage.setItem('route', urlEndpointToRedirectBack);
    localStorage.setItem('subCategoryIdForRouting', String(this.subCategoryIdFromCart));
    this.router.navigate(['signin']);
  }

  checkUserLoginStatus() {
    if (!localStorage.getItem('userId')) {
      this.userLoginStatus = false;
    }

  }

  //load cartItems from cart-state service
  loadCartItems(): void {
    this.serviceList = this.cartStateService.getServicesForSubCategory(this.subCategoryIdFromCart);
    this.recalculateTotals();
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
    this.selectedSlot = state;
    this.showTimeSlotPopup = false;
  }

  /* ------------------- helpers ------------------------------ */

  getfees(): void {
    this.baseService.GET<any>("https://localhost:7282/api/Fees").subscribe(Response => {
      this.Fees = Response.data;
      this.recalculateTotals();
      console.log(this.Fees);
    })
  }

  getSubtotal(): number {
    return this.serviceList.reduce((sum, item) => sum + item.quantity * item.price, 0);
  }

  /** Dynamic Taxes & Fees based on slab table */
  getTaxesAndFees = 0;
  recalculateTotals(): void {
    const subtotal = this.getSubtotal();
    // console.log(this.Fees);
    const slab = this.Fees.find(f => subtotal >= f.startRange && subtotal <= f.endRange);
    this.getTaxesAndFees = slab ? +(subtotal * slab.charge / 100).toFixed(2) : 0;
  }

  /** Grand total */
  getGrandTotal(): number {
    return this.getSubtotal() + this.getTaxesAndFees;
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
    console.log('Order placed!', this.customer, this.serviceList, this.getTaxesAndFees);
    alert('Thank you! Your order has been placed.');
  }


  getRegionBySearch(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    let regionName = input.value.trim();
    const onlyAlphabets = /^[a-zA-Z]$/.test(event.key);
    if (regionName.length === 0) {
      this.searchRegion = [];
      this.selectedRegionData = null;
      return;
    }
    if (event.key.length == 1 && onlyAlphabets && regionName.length >= 2) {

      console.log("Keyborad event : " + event.key);
      console.log("input data : " + regionName);

      let maxrecord = 10;
      let searchType = "area";
      this.baseService.GET<any>("https://localhost:7282/api/ServiceAreaMapping/GetAreaBySearch?name=" + regionName + "&maxrecord=" + maxrecord + "&searchType=" + searchType)
        .subscribe(response => {
          console.log("Get area by search : " + JSON.stringify(response));
          this.searchRegion = response.data;
          console.log("search result : " + this.searchRegion);
        });
    }
  }
  selectArea(region: any): void {
    this.user.ariaName = region.name;
    this.searchRegion = []; // Hide dropdown
  }
  /* ----------- address load up --------------*/
  //Just to load mobile number and userId from localStorage when user logs in 
  loadUserIdAndMobileNumberIfUserIsLoggedIn(){
    //set values of userId and mobileNumber once user logs-in
    this.userId = localStorage.getItem('userId');
    this.mobileNumber = localStorage.getItem('mobileNumber');

    this.user.userId = this.userId;
    this.user.Mobilenumber = this.mobileNumber;
  }

  openAddressPopup(): void {
    this.showAddressPopup = true;
    // this.loadUserDetails();
  }

  closeAddressPopup(): void {
    this.showAddressPopup = false;
  }

  loadUserDetails(): void {
    this.baseService.GET<any>("https://localhost:7282/api/User/GetById?userId=" + this.userId)
      .subscribe(response => {
        console.log('User details loaded', response);
        const data = response.data;
        if (data.houseNumber) this.user.houseNumber = data.houseNumber;
        if (data.landmark) this.user.landmark = data.landmark;
        if (data.ariaName) this.user.ariaName = data.ariaName;

      });
  }

  updateAddress(): void {
    const updatedUser = {
      userId: this.user.userId,
      Mobilenumber: this.user.Mobilenumber,
      houseNumber: this.user.houseNumber,
      landmark: this.user.landmark,
      ariaName: this.user.ariaName,
      locationType: this.user.locationTypeId === 1 ? 'HOME' : this.user.customLabel
    };

    console.log("Submitting address", updatedUser);
    this.baseService.PUT<any>("https://localhost:7282/api/User", updatedUser)
      .subscribe(response => {
        console.log('Address updated successfully', response);

        this.closeAddressPopup(); // Only closes here



      });
  }
}