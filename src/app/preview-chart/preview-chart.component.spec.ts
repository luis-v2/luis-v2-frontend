import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewChartComponent } from './preview-chart.component';

describe('PreviewChartComponent', () => {
  let component: PreviewChartComponent;
  let fixture: ComponentFixture<PreviewChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviewChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviewChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
