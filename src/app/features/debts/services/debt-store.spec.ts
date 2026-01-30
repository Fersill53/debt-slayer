import { TestBed } from '@angular/core/testing';

import { DebtStore } from './debt-store';

describe('DebtStore', () => {
  let service: DebtStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DebtStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
