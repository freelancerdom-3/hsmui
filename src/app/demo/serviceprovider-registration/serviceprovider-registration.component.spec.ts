import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceproviderRegistrationComponent } from './serviceprovider-registration.component';

describe('ServiceproviderRegistrationComponent', () => {
  let component: ServiceproviderRegistrationComponent;
  let fixture: ComponentFixture<ServiceproviderRegistrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceproviderRegistrationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceproviderRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
