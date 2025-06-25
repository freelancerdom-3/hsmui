import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubcatagorycartComponent } from './subcatagorycart.component';

describe('SubcatagorycartComponent', () => {
  let component: SubcatagorycartComponent;
  let fixture: ComponentFixture<SubcatagorycartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubcatagorycartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubcatagorycartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
