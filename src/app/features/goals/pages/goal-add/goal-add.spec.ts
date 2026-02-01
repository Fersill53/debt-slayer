import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoalAdd } from './goal-add.component';

describe('GoalAdd', () => {
  let component: GoalAdd;
  let fixture: ComponentFixture<GoalAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoalAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoalAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
