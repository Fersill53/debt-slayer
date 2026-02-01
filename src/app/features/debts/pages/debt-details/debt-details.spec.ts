import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebtDetails } from './debt-details';

describe('DebtDetails', () => {
  let component: DebtDetails;
  let fixture: ComponentFixture<DebtDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebtDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebtDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
