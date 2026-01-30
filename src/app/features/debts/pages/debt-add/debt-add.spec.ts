import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebtAdd } from './debt-add';

describe('DebtAdd', () => {
  let component: DebtAdd;
  let fixture: ComponentFixture<DebtAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebtAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebtAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
