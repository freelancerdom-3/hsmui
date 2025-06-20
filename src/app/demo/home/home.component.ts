import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BaseService } from 'src/app/services/base.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-home',
  imports: [CommonModule, SharedModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

	constructor(private baseService: BaseService, private activatedRoute: ActivatedRoute){

	}

	private categoryId: number;
	subCategories: any[] = [];

	ngOnInit(){
		this.activatedRoute.queryParams.subscribe(params => {
			if(params['categoryId']){
				this.categoryId = params['categoryId'];
			}
			else{
				console.log("Didn't received categoryId");
			}
		});
		this.getHomeSubCategories();
	}

	getHomeSubCategories(){
		this.baseService.GET<any>("https://localhost:7282/api/SubCategory/GetByCategoryId?CategoryId="+this.categoryId)
		.subscribe(response => {
			console.log("Home component response : "+response);
			this.subCategories = response.data;
		})
	}

	getServicesFromSubCategoryId(subCategoryId:number){
		console.log("Sub-category id : "+ subCategoryId);
	}
}
