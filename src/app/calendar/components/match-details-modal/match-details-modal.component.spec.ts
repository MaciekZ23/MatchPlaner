import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchDetailsModalComponent } from './match-details-modal.component';

describe('MatchDetailsModalComponent', () => {
  let component: MatchDetailsModalComponent;
  let fixture: ComponentFixture<MatchDetailsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchDetailsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
