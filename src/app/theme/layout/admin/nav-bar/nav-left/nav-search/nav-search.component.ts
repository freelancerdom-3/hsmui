// angular import
import { Component } from '@angular/core';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { BaseService } from 'src/app/services/base.service';
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
  
 
  // constructor
  constructor(private baseService: BaseService) {
    this.searchWidth = 0;
  }
  ngOnInit(): void {
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

    getseviceBySearch(event:KeyboardEvent){
      const input = event.target as HTMLInputElement;
      let serviceName = input.value.trim();
      const onlyAlphabets = /^[a-zA-Z]$/.test(event.key);
      if(event.key.length == 1 && onlyAlphabets)
        {  
        console.log("Keyborad event : "+event.key);
        console.log("input data : "+serviceName);
      this.baseService.GET("https://localhost:7282/api/Services/GetByName?ServiceName="+serviceName)
      .subscribe(response => {
        console.log("Get Servis by search : "+JSON.stringify(response));
      });
    }
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
