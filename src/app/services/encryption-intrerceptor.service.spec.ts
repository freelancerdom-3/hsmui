import { TestBed } from '@angular/core/testing';

import { EncryptionIntrerceptorService } from './encryption-intrerceptor.service';

describe('EncryptionIntrerceptorService', () => {
  let service: EncryptionIntrerceptorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EncryptionIntrerceptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
