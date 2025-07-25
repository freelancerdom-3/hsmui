import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BaseService } from './base.service';
import { DataService } from './data.service';
import { of } from 'rxjs';

/* I have created this cart-state service as a centralized storage to be interacted by components those are 
subscribed to it so it data is accessible to all of those and not matter where it is called it performs just
fine and this cart-state service interacts with backend API call so this one is like the one which keeps 
the track of front-end and backend cart.
*/

//This interface is to ensure type safety of the data and this also gives flexibility to add new property to carry on with it.
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
export class CartStateService{

	//Cart object
	private cartId: number;

	//Declare new maps here 
	private readonly subCategoryDataMap = new Map<number, SubCategoryData>();
	private readonly subCategoryServiceDataMap = new Map<number, Map<number, ServiceData>>();

	//Trigger which is responsible to update quantity by creating a Behaviour subject with return type as undefined
	private serviceQuantityChangedSubject = new BehaviorSubject<void>(undefined);
	serviceQuantityChanged$ = this.serviceQuantityChangedSubject.asObservable();

	private isLoggedIn = false;

	constructor(private baseService: BaseService, private dataService: DataService) {
		this.loadMapsFromLocalStorage();

		//Trigger from data service to load cart once user logs in
		this.dataService.userLoginStatusChanged$.subscribe((status: boolean) => {
			this.isLoggedIn = status;
			console.log("Cart-state service triggered on user login");
			if (status) {
				this.loadCartFromLocalStorage();
				this.updateServicesToBackendCart();
			} else {
				console.log('User logged out, skip backend updates.');
				this.cartId = null;
			}
		});
	}


	loadCartFromLocalStorage(){
		console.log("User logged in, fetch cart from localstorage");
		this.cartId = Number(localStorage.getItem('cartId'));
	}

	// generateCartAndSaveToLocalStorage(){
	// 	// this.baseService.GET<any>("https://localhost:7282/api/GenerateCart").subscribe(response => {
	// 	// 	//initialize cart from response to cartObject
	// 	// 	this.cartObject = response.data;
	// 	// 	//set cart to localstorage once received from backend.
	// 	// 	localStorage.setItem('cart', JSON.stringify(response.data));
	// 	// });
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
			if(this.isLoggedIn){
				const POSTPayload = {
					serviceId,
					cartId : this.cartId,
					price,
					quantity: this.subCategoryServiceDataMap.get(subCategoryId).get(serviceId).quantity
				}
				//MAKE a POST API call to backend for service-cart mapping
				this.baseService.POST<any>("https://localhost:7282/api/ServiceCartMapping", POSTPayload).subscribe(response => {
					console.log("Response after adding a service ===> "+ JSON.stringify(response.data).toString());
				});
				console.log("Service added for the first time when user logged-In");
			}
		} 
		else {
			//else get the service and update the quantity
			//PUT API for service-cart mapping
			const service = serviceMap.get(serviceId);
			service.quantity = currentQuantity + 1;
			serviceMap.set(serviceId, service);

			//Generate a PUT Payload to update that data in backend
			if(this.isLoggedIn){
				const PUTPayload = {
					serviceId,
					cartId: this.cartId,
					price,
					quantity: this.subCategoryServiceDataMap.get(subCategoryId).get(serviceId).quantity
				}
				//Make a PUT API call here after service's quantity is updated
				this.baseService.PUT<any>("https://localhost:7282/api/ServiceCartMapping", PUTPayload).subscribe(response => {
					console.log("Response after updating quantity of a service ===> "+JSON.stringify(response.data).toString());
				})
				console.log("Service quantity increased when user logged-In");
			}
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
			if(this.isLoggedIn){
				const DELETEPayload = {
					cartId: this.cartId,
					serviceId: serviceId
				}
				this.baseService.DELETE<any>("https://localhost:7282/api/ServiceCartMapping", DELETEPayload).subscribe(response => {
					console.log("Response from DELETE API : "+ response);
				})
				console.log("Service deleted when user logged-In");
			}
		} 
		else {
			serviceMap.set(serviceId, service);
			//PUT API for service-cart mapping
			//Only if the user is logged in, the status can be fetched from data-service
			if(this.isLoggedIn){
					const PUTPayload = {
					serviceId,
					cartId: this.cartId,
					price: this.subCategoryServiceDataMap.get(subCategoryId).get(serviceId).price,
					quantity: this.getServiceQuantityFromSubCategory(subCategoryId, serviceId)
				}
				this.baseService.PUT<any>("https://localhost:7282/api/ServiceCartMapping", PUTPayload).subscribe(response => {
					console.log("Response from remove service and updating it ===> "+JSON.stringify(response.data).toString());
				});
				console.log("Service quantity reduced after user logged-In");
			}
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

	//This method loads maps from localstorage
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

	/** 
	 * Flattens and returns a list of all services (across all subcategories) 
	 * as an array of type ServiceData.
	 */
	getAllServicesAsFlatList(): ServiceData[] {
		const flatList: ServiceData[] = [];

		for (const serviceMap of this.subCategoryServiceDataMap.values()) {
			for (const service of serviceMap.values()) {
				flatList.push({ ...service });  // clone to avoid direct mutation <--- Deep copy to eliminate all possibilities of mutation
			}
		}

		return flatList;
	}

	//This updates services to backend cart
	updateServicesToBackendCart(){
		const servicesList: ServiceData[] = this.getAllServicesAsFlatList();
		/*Even if the front-end's cart is empty, still the backend-cart might even contain the the data which is supposed to 
		be updated to front-end cart so this call will happend irrespective of items in front-end cart
		*/
		console.log("cart-state service get all services as flat list : "+JSON.stringify(this.getAllServicesAsFlatList()).toString());
		console.log("Backend call will happen");
		//Here update services to storage and release the trigger to update services
		this.sendServicesToBackendAndUpdateTheCurrentStorage(this.cartId, servicesList);
		//trigger that will notify all subscribers to update the values
		// this.serviceQuantityChangedSubject.next();
	}

	//function to send services in flat list format, and each object contains ---> serviceId, serviceName, quantity and price
	sendServicesToBackendAndUpdateTheCurrentStorage(cartIdToSend: number, servicesList: ServiceData[]) {
		console.log("sent services to cartId = " + cartIdToSend + " in backend");
		const serviceCartPAYLOAD = {
			cartId: cartIdToSend,
			serviceQuantityList: servicesList
		};
		this.baseService.POST<any>("https://localhost:7282/api/ServiceCartMapping/AddServicesByList", serviceCartPAYLOAD).subscribe(response => {
			console.log("Response after updating cart services" + JSON.stringify(response.data).toString());
			console.log("Response message : " + response.message);
			this.updateDataMapWithBackendMapData(response.data);
			this.serviceQuantityChangedSubject.next();
		});
	}

	/* ✅ NEW METHOD: Updates both maps from backend response and stores to localStorage
	only if there are some services received from backend's response.
	*/
	private updateDataMapWithBackendMapData(backendResponse: any[]): void {
		if(backendResponse.length > 0){
			for (const entry of backendResponse) {
				const subCategoryData = entry.subCategoryImageNameData;
				const subCategoryId = subCategoryData.subCategoryId;

				// Update subCategoryDataMap
				this.subCategoryDataMap.set(subCategoryId, subCategoryData);

				// Prepare service map for each subcategory
				const serviceMap = new Map<number, ServiceData>();
				for (const service of entry.serviceQuantityList) {
					serviceMap.set(service.serviceId, service);
				}
				this.subCategoryServiceDataMap.set(subCategoryId, serviceMap);
			}
			// Persist to localStorage
			this.saveMapsToLocalStorage();
		}
	}

	//This method deletes placed order in sequential execution first from backend and then from front-end
	deletePlacedServices(subCategoryId: number): void {
		// Step 1: Get services of subCategoryId using your utility
		const serviceList = this.getServicesForSubCategory(subCategoryId);
		if (!serviceList || serviceList.length === 0) {
			console.warn('No services to delete for subCategoryId:', subCategoryId);
			return;
		}

		// Step 2: Call backend delete API (reusing existing method)
		this.deletePlacedServicesFromBackendCart(subCategoryId, serviceList).subscribe({
			next: () => {
				// Step 3: Delete from local maps (reusing your method that returns Promise)
				this.deletePlacedServicesFromMaps(subCategoryId).then(() => {
					// Step 4: Emit change trigger
					this.serviceQuantityChangedSubject.next();
				});
			},
			error: (error) => {
				console.error('Backend deletion failed:', error);
			}
		});
	}

	private deletePlacedServicesFromBackendCart(subCategoryId: number, servicesList: ServiceData[]): Observable<any> {
		const deletePlacedServicePAYLOAD = {
			cartId: this.cartId,
			serviceQuantityList: servicesList
		};

		console.log("✅ [Simulated] deletePlacedServicesFromBackendCart called with payload:", deletePlacedServicePAYLOAD);
		// ✅ Placeholder for real API call
		return this.baseService.DELETE<any>(
		  "https://localhost:7282/api/ServiceCartMapping/DeletePlacedServices",
		  deletePlacedServicePAYLOAD
		);


		// Return a mock observable simulating success
		// return of({ success: true }); // import { of } from 'rxjs';
	}

	private deletePlacedServicesFromMaps(subCategoryId: number): Promise<void> {
		return new Promise((resolve) => {
			this.subCategoryServiceDataMap.delete(subCategoryId);
			this.subCategoryDataMap.delete(subCategoryId);
			this.saveMapsToLocalStorage();

			console.log("✅ [Simulated] deletePlacedServicesFromMaps executed for subCategoryId:", subCategoryId);
			resolve();
		});
	}


}
