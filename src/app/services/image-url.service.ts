import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageUrlService {

	private imageMap$: Observable<Record<string, string>>;

	constructor(private http: HttpClient) {
		this.imageMap$ = this.http.get<Record<string, string>>('/assets/image-url.json').pipe(
			shareReplay(1) //cache it for future
		);
	 }

	 getImageUrl(imageName: string): Observable<string | undefined>{
		return this.imageMap$.pipe(map(map => map[imageName]))
	 }

	 getAll(): Observable<Record<string, string>> {
		return this.imageMap$;
	 }

}
