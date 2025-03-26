import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraCuuHoGiaDinhComponent } from './tra-cuu-ho-gia-dinh.component';

describe('TraCuuHoGiaDinhComponent', () => {
  let component: TraCuuHoGiaDinhComponent;
  let fixture: ComponentFixture<TraCuuHoGiaDinhComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TraCuuHoGiaDinhComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TraCuuHoGiaDinhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
