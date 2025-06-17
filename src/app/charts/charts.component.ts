import { Component, OnInit, ViewChild } from '@angular/core';
import { SelectionComponent } from '../selection/selection.component';
import { ChartModule } from 'primeng/chart';
import { DataproviderService } from '../dataprovider.service';
import { Subject, takeUntil } from 'rxjs';
import { DataPoint } from '../../interfaces/dataPoint.interface';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'luis-charts',
  standalone: true,
  imports: [SelectionComponent, ChartModule, ButtonModule],
  templateUrl: './charts.component.html',
  styleUrl: './charts.component.scss'
})
export class ChartsComponent implements OnInit {
  private unsubscribe$ = new Subject<void>();
  protected chartData: any;

  @ViewChild('chart') chart: any;

  constructor(private dataProvider: DataproviderService) {}

  ngOnInit(): void {
    this.dataProvider.dataLoaded.pipe(takeUntil(this.unsubscribe$)).subscribe(r => {
      this.generateChartData(r);
    });
  }

  generateChartData(data: DataPoint[]) {
    var d = {
      labels: data.map(x => x.timestamp.toLocaleDateString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'})),
      datasets: <any>[]
    };

    Object.keys(data?.[0] ?? {}).slice(1).forEach(key => {
      d.datasets.push({
        label: key,
        data: data.map(x => x[key]),
        fill: false
      });
    });

    this.chartData = d;
  }

  downloadChartImage() {
    const link = document.createElement('a');
    link.download = 'chart.png';
    link.href = this.chart.getBase64Image();
    link.click();
  }
}
