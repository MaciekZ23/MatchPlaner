import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeagueDescriptionComponent } from './league-description.component';

describe('LeagueDescriptionComponent', () => {
  let component: LeagueDescriptionComponent;
  let fixture: ComponentFixture<LeagueDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeagueDescriptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeagueDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
