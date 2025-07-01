import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseService } from 'src/app/services/base.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubcatagorycartComponent } from '../subcatagorycart/subcatagorycart.component';
import { DataService } from 'src/app/services/data.service';
import { CartStateService } from 'src/app/services/cart-state.service';

@Component({
  selector: 'app-subcategory',
  imports: [SharedModule, SubcatagorycartComponent],
  templateUrl: './subcategory.component.html',
  styleUrl: './subcategory.component.scss'
})
export class SubcategoryComponent implements OnInit {

	apiResponse: any;
	visibleServiceGroups: any[] = [];
	allServiceGroups: any[] = [];

	isLoading = false;
	itemsPerScroll = 2;
	scrollIndex = 0;
	responseData: any;

	subCategoryIdFromClick: number;

	// serviceQuantities = new Map<number, number>();
	generatedCartObject: any;

	// displayQuantities = new Map<number, number>();


	subCategoryIdToDisplay: number;
	subCategoryNameToDisplay: string;
	subCategoryImageNameToDisplay: string;

	constructor(
		private baseService: BaseService,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private dataService: DataService,
		private cartStateService: CartStateService
	) {}

	ngOnInit() {
		console.log("Inside subCategoryPage");
		this.subCategoryIdFromClick = Number(localStorage.getItem('subCategoryIdFromClick'));
		this.loadServiceFromSubCategory();
		// eslint-disable-next-line no-debugger

		//this trigger is defined in cart-state service and subscribed here
		this.cartStateService.serviceQuantityChanged$.subscribe(() => {
			// Trigger change detection when quantity updates
			// (you could also use ChangeDetectorRef.detectChanges(), but this is cleaner)
		});
	}

	loadServiceFromSubCategory() {
		this.baseService.GET<any>("https://localhost:7282/api/Services/GetBySubCategoryId?subCategoryId=" + this.subCategoryIdFromClick)
			.subscribe(response => {
				this.apiResponse = response.data;
				this.allServiceGroups = this.apiResponse.childSubCategoryServicesList;

				this.subCategoryIdToDisplay = response.data.subCategoryImageNameData.subCategoryId;
				this.subCategoryNameToDisplay = response.data.subCategoryImageNameData.subCategoryName;
				this.subCategoryImageNameToDisplay = response.data.subCategoryImageNameData.subCategoryImageName;

				this.loadMoreGroups();
			});
	}

	loadMoreGroups() {
		if (this.isLoading || this.scrollIndex >= this.allServiceGroups.length) return;

		this.isLoading = true;

		setTimeout(() => {
			const nextBatch = this.allServiceGroups.slice(
				this.scrollIndex,
				this.scrollIndex + this.itemsPerScroll
			);

			if (nextBatch.length > 0) {
				this.visibleServiceGroups.push(...nextBatch);
				this.scrollIndex += this.itemsPerScroll;
			}

			this.isLoading = false;
		}, 500);
	}

	onScroll(event: any) {
		const el = event.target;
		if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
			this.loadMoreGroups();
		}
	}

	getQuantity(serviceId: number): number {
		const quantity = this.cartStateService.getServiceQuantityFromSubCategory(this.subCategoryIdToDisplay, serviceId);
		console.log("fetched quantity for : "+serviceId+ " and its quantity = "+quantity);
		return quantity;
	}

	
	addService(
		subCategoryId: number,
		subCategoryName: string,
		subCategoryImageName: string,
		serviceId: number,
		serviceName: string,
		price: number
	): void {
		
		this.cartStateService.addOrUpdateService(subCategoryId, subCategoryName, subCategoryImageName, serviceId, serviceName, price);
	}

	removeService(subCategoryId:number, serviceId: number): void {
		this.cartStateService.removeService(subCategoryId, serviceId)
	}


}
