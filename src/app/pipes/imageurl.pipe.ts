// src/app/pipes/imageurl.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { ImageUrlService } from '../services/image-url.service';
import { Observable } from 'rxjs'; // Import Observable

@Pipe({
  name: 'imageurl',
  pure: true, // Set to true if it only depends on inputs, false if it depends on internal state updates
  standalone: true
})
export class ImageurlPipe implements PipeTransform {

  // Removed the internal cache here. The service already handles caching (shareReplay)
  // and localStorage, making this pipe's cache redundant and potentially problematic
  // with asynchronous updates.

  constructor(private imageUrlService: ImageUrlService) {}

  /**
   * Transforms an image name into an Observable that emits the image URL.
   * This pipe now returns an Observable, which should be used with the async pipe in templates.
   */
  transform(imageName: string): Observable<string | undefined> {
    return this.imageUrlService.getImageUrl(imageName);
  }
}