// src/app/services/image-url.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of, shareReplay, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageUrlService {

  private readonly IMAGE_MAP_STORAGE_KEY = 'imageMap'; // Key for localStorage

  private imageMap$: Observable<Record<string, string>>;

  constructor(private http: HttpClient) {
    this.imageMap$ = this.loadImageMap();
  }

  private loadImageMap(): Observable<Record<string, string>> {
    // 1. Try to load from localStorage first
    const storedImageMap = localStorage.getItem(this.IMAGE_MAP_STORAGE_KEY);

    if (storedImageMap) {
      try {
        const parsedMap = JSON.parse(storedImageMap);
        console.log('Image map loaded from localStorage.');
        return of(parsedMap).pipe(
          shareReplay(1) // Still cache for ongoing session
        );
      } catch (e) {
        console.error('Error parsing image map from localStorage:', e);
        // Fall through to fetch from network if parsing fails
      }
    }

    // 2. If not in localStorage or parsing failed, fetch from network
    console.log('Fetching image map from network.');
    return this.http.get<Record<string, string>>('/assets/image-url.json').pipe(
      tap(mapData => {
        // Store in localStorage after successful network fetch
        localStorage.setItem(this.IMAGE_MAP_STORAGE_KEY, JSON.stringify(mapData));
        console.log('Image map saved to localStorage.');
      }),
      shareReplay(1) // Cache for current session
    );
  }

  /**
   * Retrieves the URL for a given image name.
   * This method directly exposes the Observable from the imageMap$.
   */
  getImageUrl(imageName: string): Observable<string | undefined> {
    return this.imageMap$.pipe(map(map => map[imageName]));
  }

  /**
   * Retrieves the entire map of image names to URLs.
   */
  getAll(): Observable<Record<string, string>> {
    return this.imageMap$;
  }
}