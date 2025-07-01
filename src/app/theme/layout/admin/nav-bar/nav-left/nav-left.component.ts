// angular import
import { Component, OnDestroy, OnInit } from '@angular/core';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NavSearchComponent } from './nav-search/nav-search.component';

//
import screenfull from 'screenfull';
import { BaseService } from 'src/app/services/base.service';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { filter } from 'rxjs/operators';


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
	activeItem: number = 0;
	searchResult: any[] = [];
	searchText: string = '';
	selectedRegionData: any = null;

	//to store current route
	currentRoute: string = "";

	//to check if dashboard is on or not
	isOnDashboard: boolean = false;

	constructor(private baseService: BaseService, private router: Router, private dataService: DataService) { }
	// life cycle hook
	ngOnInit() {
		if (screenfull.isEnabled) {
			this.screenFull = screenfull.isFullscreen; // Initialize based on current fullscreen state
			screenfull.on('change', () => {
				this.screenFull = screenfull.isFullscreen;
			});
		}
		
		this.router.events.pipe(
		filter(event => event instanceof NavigationEnd)
			).subscribe((event: any) => {
			const currentUrl = event.urlAfterRedirects;

			if (currentUrl.includes('/dashboard')) {
			this.dataService.setOnDashboard(true);
			} 
			else {
			this.dataService.setOnDashboard(false);
			}
		});

		this.dataService.onDashboard$.subscribe(isDash => {
			this.isOnDashboard = isDash;
		});

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


	// getRegionBySearch(event: KeyboardEvent) {
	// 	const input = event.target as HTMLInputElement;
	// 	let regionName = input.value.trim();
	// 	const onlyAlphabets = /^[a-zA-Z]$/.test(event.key);
	// 	if (regionName.length === 0) {
	// 		this.searchResult = [];
	// 		this.selectedRegionData = null;
	// 		return;
	// 	}
	// 	if (event.key.length == 1 && onlyAlphabets && regionName.length >= 2) {

	// 		console.log("Keyborad event : " + event.key);
	// 		console.log("input data : " + regionName);

	// 		let maxrecord = 10;
	// 		this.baseService.GET<any>("https://localhost:7282/api/ServiceAreaMapping/GetAreaBySearch?name=" + regionName + "&maxrecord=" + maxrecord)
	// 			.subscribe(response => {
	// 				console.log("Get area by search : " + JSON.stringify(response));
	// 				this.searchResult = response.data;
	// 				console.log("search result : " + this.searchResult);
	// 			})
	// 	}
	// }

	// selectedRegion(region: any) {
	// 	console.log("this is selected region" + region.id);
	// 	this.selectedRegionData = region;
	// 	this.searchText = region.name + " " + region.parent;
	// 	this.searchResult = [];

	// 	this.dataService.setSelectedRegion(region); 
	// 	this.dataService.triggerRegionChanged();
	// }

	//load categories
	loadCategories() {
		this.baseService.GET<any>("https://localhost:7282/api/Category").subscribe(response => {
			console.log("All categories : " + JSON.stringify(response.data).toString());
			this.categories = response.data;
		})
		this.activeItem = this.categories[0];
	}

	navigateToCategory(categoryId: number) {
		this.activeItem = categoryId; // Only set on click
		localStorage.setItem('categoryIdFromClick', String(categoryId));
		this.dataService.categoryIdChangedSubject.next();
		
		if(!this.router.url.includes('/category')){
			this.router.navigate(['category']);
		}
	}


}
