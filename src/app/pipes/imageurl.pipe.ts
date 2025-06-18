import { Pipe, PipeTransform } from '@angular/core';
import { ImageUrlService } from '../services/image-url.service';

@Pipe({
  name: 'imageurl',
  pure: false,
  standalone: true
})
export class ImageurlPipe implements PipeTransform {

	private cache = new Map<string, string | undefined>();
	
	constructor(private imageUrlService: ImageUrlService){

	}

	transform(imageName: string): string | undefined {
		if(this.cache.has(imageName)){
			return this.cache.get(imageName);
		}

		this.imageUrlService.getImageUrl(imageName).subscribe(url => {
			if(url != undefined){
				this.cache.set(imageName, url);
			}
		})

		return undefined;
	}

}
