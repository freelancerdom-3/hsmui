import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BaseService } from 'src/app/services/base.service';
import { DataService } from 'src/app/services/data.service';
import { SharedModule } from 'src/app/theme/shared/shared.module';

@Component({
  selector: 'app-category',
  imports: [SharedModule, CommonModule],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent implements OnInit, OnDestroy{
    
    constructor(private baseService: BaseService, private activatedRoute: ActivatedRoute, private router: Router, private dataService: DataService){

	}

	private categoryId: number;
	subCategories: any[] = [];

    private categorySubscription: Subscription;

	ngOnInit() {
        // Initial load
        this.loadFromLocalStorage();

        // Listen to changes
        this.categorySubscription = this.dataService.categoryIdChanged$.subscribe(() => {
            this.loadFromLocalStorage();
        });
    }

  ngOnDestroy(): void {
    this.categorySubscription?.unsubscribe();
  }

    loadFromLocalStorage() {
        this.categoryId = Number(localStorage.getItem('categoryIdFromClick'));
        if (this.categoryId) {
            this.loadSubCategories();
        }
    }

	loadSubCategories(){
		this.baseService.GET<any>("https://localhost:7282/api/SubCategory/GetByCategoryId?CategoryId="+this.categoryId)
		.subscribe(response => {
			console.log("Home component response : "+response);
			this.subCategories = response.data;
		})
	}

	navigateToSubCategory(subCategoryId:number){
		localStorage.setItem('subCategoryIdFromClick', String(subCategoryId));
        this.router.navigate(['subcategory']);
	}
}
