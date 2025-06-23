import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private router: Router) { }
  regionChanged:boolean;
  serviceChanged:boolean;

  private selectedRegionSubject = new BehaviorSubject<any>(null);
  selectedRegion$ = this.selectedRegionSubject.asObservable();

  // private regionChangedSubject = new BehaviorSubject<boolean>(false);
  // regionChanged$ = this.regionChangedSubject.asObservable();


  // triggerRegionChanged() {
  //   console.log("trigger change in dataservice");
  //   this.regionChangedSubject.next(true);
  // }

  setSelectedRegion(region: any) {
    console.log("this is dataservice file"+region);
    this.selectedRegionSubject.next(region);
    this.router.navigate(['dashboard']);
  }
}
