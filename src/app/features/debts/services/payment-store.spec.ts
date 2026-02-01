import { TestBed } from '@angular/core/testing';

import { PaymentStore } from './payment-store';

describe('PaymentStore', () => {
  let service: PaymentStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
