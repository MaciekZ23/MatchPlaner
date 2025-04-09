import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchTimerComponent } from './match-timer.component';

describe('MatchTimerComponent', () => {
  let component: MatchTimerComponent;
  let fixture: ComponentFixture<MatchTimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchTimerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
