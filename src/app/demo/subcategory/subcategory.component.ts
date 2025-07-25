import { Component, OnInit , OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseService } from 'src/app/services/base.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { SubcatagorycartComponent } from '../subcatagorycart/subcatagorycart.component';
import { DataService } from 'src/app/services/data.service';
import { CartStateService } from 'src/app/services/cart-state.service';
import { UtilityService } from 'src/app/services/utility.service';

import { Subject , Subscription} from 'rxjs';//debouce
import { debounceTime } from 'rxjs/operators';//debounce

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

	//Add subject For Debouncing for ADD
	private addServiceSubject = new Subject<any>();
	private addServiceSubscription!: Subscription;
	//Add subject For Debouncing for REMOVE
	private removeServiceSubject = new Subject<any>();
	private removeServiceSubscription!: Subscription;


	constructor(
		private baseService: BaseService,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private dataService: DataService,
		private cartStateService: CartStateService,
		private utilityService: UtilityService
	) {}

	ngOnInit() {
		console.log("Inside subCategoryPage");

		//load subCategoryId from click form localstorage
		this.subCategoryIdFromClick = Number(localStorage.getItem('subCategoryIdFromClick'));

		//load services from subCategory
		this.loadServiceFromSubCategory();
		
		localStorage.setItem('route', this.utilityService.extractLastSegment(this.router.url));
		localStorage.setItem('subCategoryIdForRouting', String(this.subCategoryIdFromClick));

		//this trigger is defined in cart-state service and subscribed here
		this.cartStateService.serviceQuantityChanged$.subscribe(() => {
			// Trigger change detection when quantity updates
			// (you could also use ChangeDetectorRef.detectChanges(), but this is cleaner)
		});

		// Debounced Add Service Subscription
		this.addServiceSubscription = this.addServiceSubject.pipe(
			debounceTime(500)
			).subscribe(({ subCategoryId, subCategoryName, subCategoryImageName, serviceId, serviceName, price }) => {
			this.cartStateService.addOrUpdateService(subCategoryId, subCategoryName, subCategoryImageName, serviceId, serviceName, price);
		});

		// Debounce Remove service Subscription
		this.removeServiceSubscription = this.removeServiceSubject.pipe(
			debounceTime(500)
			).subscribe(({ subCategoryId, serviceId }) => {
			this.cartStateService.removeService(subCategoryId, serviceId);
		});
	}
	// FOR DEBOUNCE LOGIC
	ngOnDestroy() {
		if (this.addServiceSubscription) {
			this.addServiceSubscription.unsubscribe();
		}

		if (this.removeServiceSubscription) {
			this.removeServiceSubscription.unsubscribe();
		}

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
		// console.log("fetched quantity for : "+serviceId+ " and its quantity = "+quantity);
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
	 // Debounced Add Button Handler
		console.log(" Add Service clicked:", serviceId);
		this.addServiceSubject.next({ subCategoryId, subCategoryName, subCategoryImageName, serviceId, serviceName, price });
	}

	removeService(subCategoryId:number, serviceId: number): void {
		// DEBOUNCE for REMOVE 
		console.log(" Remove Service clicked:", serviceId);
  		this.removeServiceSubject.next({ subCategoryId, serviceId });
	}	


}
