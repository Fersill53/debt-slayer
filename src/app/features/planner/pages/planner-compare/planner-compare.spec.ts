import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlannerCompare } from './planner-compare.component';

describe('PlannerCompare', () => {
  let component: PlannerCompare;
  let fixture: ComponentFixture<PlannerCompare>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlannerCompare]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlannerCompare);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
