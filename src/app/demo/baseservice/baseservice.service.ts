import { Injectable } from '@angular/core';
// import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppConstant {
  public static RecordPerPage: number = 5;
  public static url = "https://localhost:7272/api/";

  //  export const RecordPerPage:number=5;
  // private itemsPerPageSubject = new BehaviorSubject<number>(2); // Default: 5 items per page
  // itemsPerPage$ = this.itemsPerPageSubject.asObservable();

  // getItemsPerPage(): number {
  //   return this.itemsPerPageSubject.value;
  // }

  // setItemsPerPage(value: number) {
  //   this.itemsPerPageSubject.next(value);
  // }
}
