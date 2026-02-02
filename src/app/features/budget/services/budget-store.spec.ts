import { TestBed } from '@angular/core/testing';

import { BudgetStore } from './budget-store.service';

describe('BudgetStore', () => {
  let service: BudgetStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BudgetStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
