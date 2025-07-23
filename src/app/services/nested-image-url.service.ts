import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, shareReplay, tap, map } from 'rxjs';
import { SubCategoryEnum } from '../enums/SubCategory.enum';
import { ChildSubCategoryEnum } from '../enums/childsubcategory.enum';
import { ServiceEnum } from '../enums/service.enum';

@Injectable({
  providedIn: 'root'
})
export class NestedImageUrlService {

  private readonly STORAGE_KEY = 'nestedImageMap';
  private imageData$: Observable<any>;

  constructor(private http: HttpClient) {
    this.imageData$ = this.loadImageData();
  }

  private loadImageData(): Observable<any> {
    const stored = localStorage.getItem(this.STORAGE_KEY);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return of(parsed).pipe(shareReplay(1));
      } catch (e) {
        console.error('Error parsing nested image map from localStorage:', e);
      }
    }

    return this.http.get('/assets/nested-image-url.json').pipe(
      tap(data => {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      }),
      shareReplay(1)
    );
  }

  getImageUrl(ids: number[]): Observable<string> {
    return this.imageData$.pipe(
      map((data) => {
        if (!ids || ids.length === 0 || ids.length > 3) return '';

        const subCategoryKey = SubCategoryEnum[ids[0]];
        if (!subCategoryKey || !data[subCategoryKey]) return '';

        if (ids.length === 1) {
          return data[subCategoryKey]?.ImagePath || '';
        }

        const childSubCategoryKey = ChildSubCategoryEnum[ids[1]];
        const childScope = data[subCategoryKey]?.[childSubCategoryKey];
        if (!childSubCategoryKey || !childScope) return '';

        if (ids.length === 2) {
          return childScope?.ImagePath || '';
        }

        const serviceKey = ServiceEnum[ids[2]];
        return childScope?.[serviceKey]?.ImagePath || '';
      })
    );
  }
}
