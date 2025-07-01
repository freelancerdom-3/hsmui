import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TimeslotComponent, TimeslotState } from '../timeslot/timeslot.component';
import { BaseService } from 'src/app/services/base.service';

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

  constructor(private baseService: BaseService){}

  ngOnInit(): void {
    this.getfees();      
  }
  /* ------------------- customer + cart --------------------- */
  customer = {
    phone: '',
    address: '',
    timeslot: '',
    paymentMethod: 'cod'
  };

  cartItems: CartItem[] = [
    { id:1 ,name: 'Coffee',   quantity: 1, price: 200 },
    { id:2 ,name: 'Muffin',   quantity: 1, price: 300 },
    { id:3 ,name: 'Sandwich', quantity: 1, price: 100 }
  ];

  //deliveryCharge = 40;

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
    return this.cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
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
  

  placeOrder(): void {
    if (!this.customer.timeslot) {
      alert('Please select a time slot first.');
      return;
    }
    console.log('Order placed!', this.customer, this.cartItems);
    alert('Thank you! Your order has been placed.');
  }
}
