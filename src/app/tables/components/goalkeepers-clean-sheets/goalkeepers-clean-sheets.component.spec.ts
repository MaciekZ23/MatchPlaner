import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoalkeepersCleanSheetsComponent } from './goalkeepers-clean-sheets.component';

describe('GoalkeepersCleanSheetsComponent', () => {
  let component: GoalkeepersCleanSheetsComponent;
  let fixture: ComponentFixture<GoalkeepersCleanSheetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoalkeepersCleanSheetsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoalkeepersCleanSheetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
