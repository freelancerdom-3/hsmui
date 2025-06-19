// angular import
import { Component, OnDestroy, OnInit} from '@angular/core';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NavSearchComponent } from './nav-search/nav-search.component';

//
import screenfull from 'screenfull';
import { BaseService } from 'src/app/services/base.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-nav-left',
  imports: [SharedModule, NavSearchComponent, RouterModule],
  templateUrl: './nav-left.component.html',
  styleUrls: ['./nav-left.component.scss']
})
export class NavLeftComponent implements OnInit, OnDestroy {
 
	screenFull = true;

	//categories item array
	categories: any[] = [];
	//to denote active
	activeItem: string = '';

	constructor(private baseService: BaseService, private router:Router) {}
	// life cycle hook
	ngOnInit() {
		if (screenfull.isEnabled) {
			this.screenFull = screenfull.isFullscreen; // Initialize based on current fullscreen state
			screenfull.on('change', () => {
				this.screenFull = screenfull.isFullscreen;
			});
		}
		this.loadCategories();
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

	loadCategories(){
		this.baseService.GET<any>("https://localhost:7282/api/Category").subscribe(response => {
			console.log("All categories : "+JSON.stringify(response.data).toString());
			this.categories = response.data;
		})
		this.activeItem = this.categories[0];
	}

	navigateToSubCategory(categoryId:number){
		console.log(categoryId);
		if(categoryId == 1){
			this.router.navigate(['home'],
				{queryParams : {
					'categoryId':categoryId
				}}
			);
		}
		else if(categoryId == 2){
			this.router.navigate(['beauty'],
				{queryParams : {
					'categoryId':categoryId
				}}
			);
		}
		else if(categoryId == 3){
			this.router.navigate(['native'],
				{queryParams : {
					'categoryId':categoryId
				}}
			);
		}
	}

}
