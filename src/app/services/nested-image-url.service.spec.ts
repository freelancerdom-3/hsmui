import { TestBed } from '@angular/core/testing';

import { NestedImageUrlService } from './nested-image-url.service';

describe('NestedImageUrlService', () => {
  let service: NestedImageUrlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NestedImageUrlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
