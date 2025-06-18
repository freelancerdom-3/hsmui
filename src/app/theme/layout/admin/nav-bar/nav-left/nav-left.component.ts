// angular import
import { Component, OnDestroy, OnInit} from '@angular/core';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NavSearchComponent } from './nav-search/nav-search.component';

//
import screenfull from 'screenfull';
import { BaseService } from 'src/app/services/base.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-nav-left',
  imports: [SharedModule, NavSearchComponent],
  templateUrl: './nav-left.component.html',
  styleUrls: ['./nav-left.component.scss']
})
export class NavLeftComponent implements OnInit, OnDestroy {
 
  screenFull = true;
  
  constructor(private baseService: BaseService) {}
  // life cycle hook
  ngOnInit() {
    if (screenfull.isEnabled) {
      this.screenFull = screenfull.isFullscreen; // Initialize based on current fullscreen state
      screenfull.on('change', () => {
        this.screenFull = screenfull.isFullscreen;
      });
    }
  }

  ngOnDestroy() {
    if (screenfull.isEnabled) {
      screenfull.off('change', () => {
        this.screenFull = screenfull.isFullscreen;
      });
    }
  }
  

  toggleFullscreen() {
    if (screenfull.isEnabled) {
      screenfull.toggle().then(() => {
        this.screenFull = screenfull.isFullscreen;
      });
    }
  }


  getRegionBySearch(event: KeyboardEvent){
    const input = event.target as HTMLInputElement;
    let regionName = input.value.trim();
    const onlyAlphabets = /^[a-zA-Z]$/.test(event.key);
    if(event.key.length == 1 && onlyAlphabets && regionName.length >= 3){
      
      console.log("Keyborad event : "+event.key);
      console.log("input data : "+regionName);

      let maxrecord = 10;
      this.baseService.GET("https://localhost:7282/api/ServiceAreaMapping/GetAreaBySearch?name="+ regionName+"&maxrecord="+maxrecord)
      .subscribe(response => {
        console.log("Get area by search : "+JSON.stringify(response));
      })
    }
  }


  

}
