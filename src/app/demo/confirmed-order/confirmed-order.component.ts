import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseService } from 'src/app/services/base.service';

@Component({
  selector: 'app-confirmed-order',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './confirmed-order.component.html',
  styleUrl: './confirmed-order.component.scss'
})
export class ConfirmedOrderComponent implements OnInit {
  orderId: number;
  orderDetails: any;
  servicesList: any[] = [];

  constructor(private router: Router, private baseService: BaseService) {}

  ngOnInit(): void {
    this.orderId = Number(localStorage.getItem('OrderId'));
    this.fetchOrderDetails();
  }

  fetchOrderDetails() {
    this.baseService.GET<any>("https://localhost:7282/api/Order/GetByConfirmedOrderId?orderId="+this.orderId).subscribe(response => {
      if (response.statusCode === 200) {
        this.orderDetails = response.data.orderDetails;
        this.servicesList = response.data.servicesList;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'UPCOMING': return 'status-upcoming';
      case 'IN-PROGRESS': return 'status-inprogress';
      case 'COMPLETED': return 'status-completed';
      default: return '';
    }
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}