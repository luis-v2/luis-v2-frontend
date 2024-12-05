import {Component, OnDestroy, OnInit} from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { DataproviderService } from '../dataprovider.service';
import { DataPoint } from '../../interfaces/dataPoint.interface';
import { Subject, takeUntil } from 'rxjs';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'luis-preview-chart',
  standalone: true,
  imports: [ChartModule, ButtonModule],
  templateUrl: './preview-chart.component.html',
  styleUrl: './preview-chart.component.scss'
})
export class PreviewChartComponent implements OnInit, OnDestroy {
  chartData: any;
  dataPoints?: DataPoint[];
  years: number[] = [];
  selectedYear?: number;

  private unsubscribe$ = new Subject<void>();

  constructor(private dataProvider: DataproviderService) {}

  ngOnInit(): void {
    this.dataProvider.dataLoaded.pipe(takeUntil(this.unsubscribe$)).subscribe(r => {
      this.dataPoints = r;

      this.years = Array.from(new Set(r.map(x => x.timestamp.getFullYear())));
      this.selectedYear = this.years[0];

      this.generateChartData(this.dataPoints!.filter(x => x.timestamp.getFullYear() == this.selectedYear));
    });
  }

  generateChartData(data: DataPoint[]) {

    const MAX_POINTS = 1095; // 3 points per day?
    var filteredData = data;
    if (data.length > MAX_POINTS) {
      const startDate = data[0].timestamp;
      const nextDay = new Date(startDate);

      nextDay.setUTCDate(nextDay.getUTCDate() + 1);

      var nextIndex = data.findIndex(x => {
        let dateOnly = new Date(x.timestamp).setHours(0, 0, 0, 0);
        let nextDayOnly = new Date(nextDay).setHours(0, 0, 0, 0);
        return dateOnly === nextDayOnly;
      });

      if (nextIndex > 0) {
        filteredData =
          data.filter((_, index) => index % Math.ceil((nextIndex / 3)) === 0);
      }
    }

    var d = {
      labels: filteredData.map(x => x.timestamp.toLocaleDateString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'})),
      datasets: <any>[]
    };

    Object.keys(filteredData?.[0] ?? {}).slice(1).forEach(key => {
      d.datasets.push({
        label: key,
        data: data.map(x => x[key]),
        fill: false
      });
    });

    this.chartData = d;
  }

  changeYear(increase: boolean) {
    this.selectedYear = this.years.find(x => x == this.selectedYear! + (increase ? 1 : -1));

    this.generateChartData(this.dataPoints!.filter(x => x.timestamp.getFullYear() == this.selectedYear));
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
