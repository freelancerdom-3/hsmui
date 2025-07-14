import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { CartStateService } from './cart-state.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private router: Router) { }

  //Max records
  maxTrendingSubCategoriesRecord = 5;

  //Max search results
  maxSearchResults = 5;

  //All Properties 
  //Region changed event
  regionChanged:boolean;
  //service changed event
  serviceChanged:boolean;
  //subCategoryIdFromClick
  subCategoryIdFromClick:number;
  subCategoryCartSubCategoryId:number;

  //tracking service quantity changes
  // serviceQuantity: number;

  //-------------------TRIGGERS-----------------------------
  private selectedRegionSubject = new BehaviorSubject<any>(null);
  selectedRegion$ = this.selectedRegionSubject.asObservable();

  // private regionChangedSubject = new BehaviorSubject<boolean>(false);
  // regionChanged$ = this.regionChangedSubject.asObservable();

  private onDashboardSubject = new BehaviorSubject<boolean>(false);
  onDashboard$ = this.onDashboardSubject.asObservable();

  public categoryIdChangedSubject = new BehaviorSubject<void>(undefined);
  categoryIdChanged$ = this.categoryIdChangedSubject.asObservable();
  
  //--------------------------------------------
  //service behaviour subject to track
  // private serviceQuantitySubject = new BehaviorSubject<any>(null);
  // serviceQuantity$ = this.serviceQuantitySubject.asObservable();

  // triggerRegionChanged() {
  //   console.log("trigger change in dataservice");
  //   this.regionChangedSubject.next(true);
  // }

  //user login status flag trigger
  private userLoginStatusSubject = new BehaviorSubject<boolean>(false);
  userLoginStatusChanged$ = this.userLoginStatusSubject.asObservable();

  //Methods that are associated with.
  setSelectedRegion(region: any) {
    console.log("this is dataservice file"+region);
    this.selectedRegionSubject.next(region);
    this.router.navigate(['dashboard']);
  }

  //for dashboar url check remove effect from nav elements
  setOnDashboard(value: boolean) {
    this.onDashboardSubject.next(value);
  }


  //Track quantity changed
  // quantityChanged(subCategoryId:number, serviceId:number){
  //   console.log("Quantity change trigger occurred");
  //   const serviceQuantity = this.cartStateService.getServiceQuantityFromSubCategory(subCategoryId, serviceId);
  //   this.serviceQuantitySubject.next(serviceQuantity);
  // }

  
  get isUserLoggedIn(): boolean {
    return this.userLoginStatusSubject.getValue();
  }
  
  //Method to set login flag
  setUserLoginStatus(isLoggedIn: boolean) {
    console.log("User log-in status set to : "+isLoggedIn);
    this.userLoginStatusSubject.next(isLoggedIn);
  }
}
