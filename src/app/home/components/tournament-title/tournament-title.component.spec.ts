import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TournamentTitleComponent } from './tournament-title.component';

describe('TournamentTitleComponent', () => {
  let component: TournamentTitleComponent;
  let fixture: ComponentFixture<TournamentTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TournamentTitleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TournamentTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
