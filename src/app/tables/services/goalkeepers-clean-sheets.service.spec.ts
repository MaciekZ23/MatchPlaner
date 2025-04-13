import { TestBed } from '@angular/core/testing';

import { GoalkeepersCleanSheetsService } from './goalkeepers-clean-sheets.service';

describe('GoalkeepersCleanSheetsService', () => {
  let service: GoalkeepersCleanSheetsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoalkeepersCleanSheetsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
