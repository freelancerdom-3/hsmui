import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginServiceproviderComponent } from './login-serviceprovider.component';

describe('LoginServiceproviderComponent', () => {
  let component: LoginServiceproviderComponent;
  let fixture: ComponentFixture<LoginServiceproviderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginServiceproviderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginServiceproviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
