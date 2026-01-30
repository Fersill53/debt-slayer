import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebtList } from './debt-list';

describe('DebtList', () => {
  let component: DebtList;
  let fixture: ComponentFixture<DebtList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebtList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebtList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
