import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BaseService } from './base.service';

export interface SubCategoryData {
  subCategoryId: number;
  subCategoryName: string;
  subCategoryImageName: string;
}

export interface ServiceData {
  serviceId: number;
  serviceName: string;
  price: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartStateService {

	//Cart object
	// private cartObject: any;
	//Declare new maps here 
	private readonly subCategoryDataMap = new Map<number, SubCategoryData>();
	private readonly subCategoryServiceDataMap = new Map<number, Map<number, ServiceData>>();

	//Trigger which is responsible to update quantity by creating a Behaviour subject with return type as undefined
	private serviceQuantityChangedSubject = new BehaviorSubject<void>(undefined);
	serviceQuantityChanged$ = this.serviceQuantityChangedSubject.asObservable();

	constructor(private baseService: BaseService) {
		//Load maps from local storage
		this.loadMapsFromLocalStorage();
		//Load cart from local storage
		// this.loadCartFromLocalStorage();
	}

	// loadCartFromLocalStorage(){
	// 	//check if cart does not exist then generate cart and save to localstorage
	// 	if(!localStorage.getItem('cart')){
	// 		this.generateCartAndSaveToLocalStorage();
	// 	}
	// 	//Till this point we will have cart object in localstorage
	// 	this.cartObject = JSON.parse(localStorage.getItem('cart'));
	// }

	// generateCartAndSaveToLocalStorage(){
	// 	this.baseService.GET<any>("https://localhost:7282/api/GenerateCart").subscribe(response => {
	// 		//initialize cart from response to cartObject
	// 		this.cartObject = response.data;
	// 		//set cart to localstorage once received from backend.
	// 		localStorage.setItem('cart', JSON.stringify(response.data));
	// 	});
	// }

	addOrUpdateService(subCategoryId: number, subCategoryName: string = '', subCategoryImageName: string = '', serviceId: number, serviceName: string, price: number): void {
		//Add subcategory data with key if not exists
		if (!this.subCategoryDataMap.has(subCategoryId)) {
			this.subCategoryDataMap.set(subCategoryId, {
				subCategoryId,
				subCategoryName,
				subCategoryImageName
			});
		}

		//create a new empty map for services in subCategoryServiceDataMap
		if (!this.subCategoryServiceDataMap.has(subCategoryId)) {
			this.subCategoryServiceDataMap.set(subCategoryId, new Map<number, ServiceData>());
		}
		
		//fetch serviceMap for direct operation instead of doing this....
		const serviceMap = this.subCategoryServiceDataMap.get(subCategoryId);
		//fetch quantity of current service quantity
		const currentQuantity = this.getServiceQuantityFromSubCategory(subCategoryId, serviceId);

		//if serviceId is not present then add that service with quantity
		//POST API for service-cart mapping
		if (!serviceMap.has(serviceId)) {
			serviceMap.set(serviceId, {
				serviceId,
				serviceName,
				price,
				quantity: currentQuantity + 1
			});
			//generate payload to send it to backend
			// const POSTPayload = {
			// 	serviceId,
			// 	cartId : this.cartObject.cartId,
			// 	price,
			// 	quantity: this.subCategoryServiceDataMap.get(subCategoryId).get(serviceId).quantity
			// }
			// //MAKE a POST API call to backend for service-cart mapping
			// this.baseService.POST<any>("https://localhost:7282/api/ServiceCartMapping", POSTPayload).subscribe(response => {
			// 	console.log("Response after adding a service ===> "+ JSON.stringify(response.data).toString());
			// })
		} 
		else {
			//else get the service and update the quantity
			//PUT API for service-cart mapping
			const service = serviceMap.get(serviceId);
			service.quantity = currentQuantity + 1;
			serviceMap.set(serviceId, service);

			//Generate a PUT Payload to update that data in backend
			// const PUTPayload = {
			// 	serviceId,
			// 	cartId: this.cartObject.cartId,
			// 	price,
			// 	quantity: this.subCategoryServiceDataMap.get(subCategoryId).get(serviceId).quantity
			// }
			// //Make a PUT API call here after service's quantity is updated
			// this.baseService.PUT<any>("https://localhost:7282/api/ServiceCartMapping", PUTPayload).subscribe(response => {
			// 	console.log("Response after updating quantity of a service ===> "+JSON.stringify(response.data).toString());
			// })
		}

		//At this point save to localstorage
		this.saveMapsToLocalStorage();
		//emit this event for notifying the change
		this.serviceQuantityChangedSubject.next();
	}


	removeService(subCategoryId: number, serviceId: number): void {
		//if subCategoryId is not present itself, then don't execute any further logic
		if (!this.subCategoryServiceDataMap.has(subCategoryId)) return;

		//fetch serviceMap from subCategoryId for easy access
		const serviceMap = this.subCategoryServiceDataMap.get(subCategoryId);
		//again if serviceId itself is not present then again return
		if (!serviceMap.has(serviceId)) return;

		//get service at this point it is confirmed that service exists
		const service = serviceMap.get(serviceId);
		service.quantity = this.getServiceQuantityFromSubCategory(subCategoryId, serviceId) - 1;

		if (service.quantity <= 0) {
			serviceMap.delete(serviceId);
			//DELETE API for service-cart mapping
			// this.baseService.DELETE<any>("https://localhost:7282/api/ServiceCartMapping")
		} 
		else {
			serviceMap.set(serviceId, service);
			//PUT API for service-cart mapping
			// const PUTPayload = {
			// 	serviceId,
			// 	cartId: this.cartObject.cartId,
			// 	price: this.subCategoryServiceDataMap.get(subCategoryId).get(serviceId).price,
			// 	quantity: this.getServiceQuantityFromSubCategory(subCategoryId, serviceId)
			// }
			// this.baseService.PUT<any>("https://localhost:7282/api/ServiceCartMapping", PUTPayload).subscribe(response => {
			// 	console.log("Response from remove service and updating it ===> "+JSON.stringify(response.data).toString());
			// })
		}

		if (serviceMap.size === 0) {
			this.subCategoryServiceDataMap.delete(subCategoryId);
			//also delete the subCategoryId from subCategoryDataMap 
			this.subCategoryDataMap.delete(subCategoryId);
		}
		//save to localstorage at this point
		this.saveMapsToLocalStorage();
		//and emit this event to subscriber
		this.serviceQuantityChangedSubject.next();
	}

	getServiceQuantityFromSubCategory(subCategoryId: number, serviceId: number): number {
		//double check if the subCategoryId exists and in that subCategoryId, serviceId also exists otherwise return 0
		if (
		this.subCategoryServiceDataMap.has(subCategoryId) &&
		this.subCategoryServiceDataMap.get(subCategoryId).has(serviceId)
		) {
		return this.subCategoryServiceDataMap.get(subCategoryId).get(serviceId).quantity;
		}
		return 0;
	}

	private saveMapsToLocalStorage(): void {
		const subCategoryDataObj = Object.fromEntries(this.subCategoryDataMap);

		const serviceDataObj = {};
		this.subCategoryServiceDataMap.forEach((serviceMap, subCategoryId) => {
			serviceDataObj[subCategoryId] = Object.fromEntries(serviceMap);
		});

		localStorage.setItem('subCategoryDataMap', JSON.stringify(subCategoryDataObj));
		localStorage.setItem('subCategoryServiceDataMap', JSON.stringify(serviceDataObj));
	}

	private loadMapsFromLocalStorage(): void {
		//Fetch maps from local-storage
		const subCategoryDataJson = localStorage.getItem('subCategoryDataMap');
		const serviceDataJson = localStorage.getItem('subCategoryServiceDataMap');

		//If maps exists, then deseralize them by iterating over them
		/*Understand this desrialization process, string objects are converted to operable plain object, again its just
		a key value pair object not a O(1) time complixity Map, so convert it to an actual Map data structure so there is only
		one way!, regenerate that map by taking the map's reference and store values to it.
		 */
		if (subCategoryDataJson) {
			const subCategoryDataObj = JSON.parse(subCategoryDataJson);
			Object.entries(subCategoryDataObj).forEach(([key, value]) => {
				this.subCategoryDataMap.set(Number(key), value as SubCategoryData);
			});
		}
		//Nested for loop to reconstruct the entire nested map data structure.
		if (serviceDataJson) {
		const serviceDataObj = JSON.parse(serviceDataJson);
			Object.entries(serviceDataObj).forEach(([subCategoryId, services]) => {
				const serviceMap = new Map<number, ServiceData>();
				Object.entries(services as Record<string, ServiceData>).forEach(([serviceId, service]) => {
					serviceMap.set(Number(serviceId), service);
				});
				this.subCategoryServiceDataMap.set(Number(subCategoryId), serviceMap);
			});
		}
	}

	//this method retrieves data for subcategory-cart component
	getServicesForSubCategory(subCategoryId: number): ServiceData[] {
		const serviceMap = this.subCategoryServiceDataMap.get(subCategoryId);
		return serviceMap ? Array.from(serviceMap.values()) : [];
	}

	//this method retrieves data for main cart method
	getGroupedCartData(): Array<{
	subCategoryId: number;
	subCategoryName?: string;
	subCategoryImageName?: string;
	services: ServiceData[];
	}> {
	const result = [];

		for (const [subCategoryId, serviceMap] of this.subCategoryServiceDataMap.entries()) {
			const subCategoryData = this.subCategoryDataMap.get(subCategoryId);

			result.push({
				subCategoryId,
				subCategoryName: subCategoryData?.subCategoryName,
				subCategoryImageName: subCategoryData?.subCategoryImageName,
				services: Array.from(serviceMap.values())
			});
		}

		return result;
	}

}
