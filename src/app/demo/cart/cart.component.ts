import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-cart',
  imports: [],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent   {

constructor(private router: Router){}

 navigateTodashboard(): void{
    this.router.navigate(['dashboard']);
  }

  
}
