import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LevelNavbarComponent } from './level-navbar.component';

describe('LevelNavbarComponent', () => {
  let component: LevelNavbarComponent;
  let fixture: ComponentFixture<LevelNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LevelNavbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LevelNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
