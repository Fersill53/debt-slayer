import { TestBed } from '@angular/core/testing';

import { GoalStore } from './goal-store';

describe('GoalStore', () => {
  let service: GoalStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoalStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
