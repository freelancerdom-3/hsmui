// angular import
import { Component } from '@angular/core';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BaseService } from 'src/app/services/base.service';
import { DataService } from 'src/app/services/data.service';
@Component({
  selector: 'app-nav-search',
  imports: [SharedModule],
  templateUrl: './nav-search.component.html',
  styleUrls: ['./nav-search.component.scss']

})
export class NavSearchComponent {
  // public props
  searchInterval;
  searchWidth: number;
  searchWidthString: string;
  searchResult: any[] = [];
  searchRegion: any[] = [];
  searchText: string = '';
  searchedRegion: string = '';
  selectedServiceData: any = null;
	selectedRegionData: any = null;






  // constructor
  constructor(private baseService: BaseService, private dataService: DataService) {
    this.searchWidth = 0;
  }
  ngOnInit(): void {
    //this.dataService.serviceChanged = true;
    // Auto-expand the search bar on component load
    this.searchOn();
  }


  public method
  searchOn() {
    document.querySelector('#main-search').classList.add('open');
    this.searchInterval = setInterval(() => {
      if (this.searchWidth >= 170) {
        clearInterval(this.searchInterval);
        // return false;
      }
      this.searchWidth = this.searchWidth + 30;
      this.searchWidthString = this.searchWidth + 'px';
    }, 35);
  }

  getseviceBySearch(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    let serviceName = input.value.trim();
    const onlyAlphabets = /^[a-zA-Z]$/.test(event.key);
    if (serviceName.length == 0) {
      this.searchResult = [];
      this.selectedServiceData = null;
      return;
    }
    if (event.key.length == 1 && onlyAlphabets && serviceName.length >= 2) {
      console.log("Keyborad event : " + event.key);
      console.log("input data : " + serviceName);
      this.baseService.GET<any>("https://localhost:7282/api/Services/GetByName?ServiceName=" + serviceName)
        .subscribe(response => {
          console.log("Get Servis by search : " + JSON.stringify(response));
          this.searchResult = response.data;
          console.log("search result : " + this.searchResult);
        });
    }
  }
  selectService(service: any) {
    console.log("THis is selected service:" + service.id);
    this.selectedServiceData = service;
    this.searchText = service.name;
    this.searchResult = [];
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
      this.baseService.GET<any>("https://localhost:7282/api/ServiceAreaMapping/GetAreaBySearch?name=" + regionName + "&maxrecord=" + maxrecord)
        .subscribe(response => {
          console.log("Get area by search : " + JSON.stringify(response));
          this.searchRegion = response.data;
          console.log("search result : " + this.searchRegion);
        })
    }
  }

  selectedRegion(region: any) {
    this.selectedRegionData = region;
    this.searchedRegion = region.name + " " + region.parent;
    this.searchRegion = [];

    this.dataService.setSelectedRegion(region);
    //this.dataService.triggerRegionChanged();
  }



  // searchOff() {
  //   this.searchInterval = setInterval(() => {
  //     if (this.searchWidth <= 0) {
  //       document.querySelector('#main-search').classList.remove('open');
  //       clearInterval(this.searchInterval);
  //       // return false;
  //     }
  //     this.searchWidth = this.searchWidth - 30;
  //     this.searchWidthString = this.searchWidth + 'px';
  //   }, 35);
  // }
}
