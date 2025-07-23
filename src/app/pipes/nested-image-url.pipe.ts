import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { NestedImageUrlService } from '../services/nested-image-url.service';

@Pipe({
  name: 'nestedImageUrl',
  pure: true,
  standalone: true
})
export class NestedImageUrlPipe implements PipeTransform {

  constructor(private imageService: NestedImageUrlService) {}

  transform(ids: number[]): Observable<string> {
    return this.imageService.getImageUrl(ids);
  }
}
