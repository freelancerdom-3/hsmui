import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseService } from 'src/app/services/base.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubcatagorycartComponent } from '../subcatagorycart/subcatagorycart.component';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-subcategory',
  imports: [SharedModule, SubcatagorycartComponent],
  templateUrl: './subcategory.component.html',
  styleUrl: './subcategory.component.scss'
})
export class SubcategoryComponent implements OnInit {
	apiResponse: any; // Full JSON parsed
	visibleServiceGroups: any[] = [];
	allServiceGroups: any[] = [];
	
	isLoading = false;
	itemsPerScroll = 2; // Load 2 groups per scroll
	scrollIndex = 0;
	responseData: any;
	subCategoryIdFromClick:number;
	
	constructor(private baseService: BaseService, private activatedRoute: ActivatedRoute,private router: Router, private dataService: DataService ){}

	ngOnInit() {
		//to get subCategoryId from home, dashboard or related components queryParams
		this.subCategoryIdFromClick = Number (localStorage.getItem('subCategoryIdFromClick'));
		// Assume you load from API
		this.loadServiceFromSubCategory();
	}

	loadServiceFromSubCategory() {
		// Replace this with real HTTP call
		
		this.baseService.GET<any>("https://localhost:7282/api/Services/GetBySubCategoryId?subCategoryId="+this.subCategoryIdFromClick)
		.subscribe(response => {
			this.responseData = response.data;
			this.apiResponse = this.responseData;
			this.allServiceGroups = this.apiResponse.childSubCategoryServicesList;
			this.loadMoreGroups(); // Initial load
		}) // ← Replace with API data
	}

	loadMoreGroups() {
		if (this.isLoading) return;
		this.isLoading = true;

		setTimeout(() => {
		const nextBatch = this.allServiceGroups.slice(
			this.scrollIndex,
			this.scrollIndex + this.itemsPerScroll
		);
		this.visibleServiceGroups.push(...nextBatch);
		this.scrollIndex += this.itemsPerScroll;
		this.isLoading = false;
		}, 500);
	}

	onScroll(event: any) {
		const el = event.target;
		if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
		this.loadMoreGroups();
		}
	}

	//add service to cart
	addService(serviceId:number){

	}
	navigateTOSubcatagoryCart(){
		 this.router.navigate(['subcatagorycart']);
	}
}

