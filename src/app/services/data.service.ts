import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }
  regionChanged:boolean;
  serviceChanged:boolean;
}
