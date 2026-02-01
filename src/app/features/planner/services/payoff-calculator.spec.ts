import { TestBed } from '@angular/core/testing';

import { PayoffCalculator } from './payoff-calculator.service';

describe('PayoffCalculator', () => {
  let service: PayoffCalculator;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PayoffCalculator);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
