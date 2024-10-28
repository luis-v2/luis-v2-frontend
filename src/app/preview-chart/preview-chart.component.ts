import { Component, OnInit } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { DataproviderService } from '../dataprovider.service';
import { DataPoint } from '../../interfaces/dataPoint.interface';

@Component({
  selector: 'luis-preview-chart',
  standalone: true,
  imports: [ChartModule],
  templateUrl: './preview-chart.component.html',
  styleUrl: './preview-chart.component.scss'
})
export class PreviewChartComponent implements OnInit {
  chartData: any;

  constructor(private dataProvider: DataproviderService) {}

  ngOnInit(): void {
    this.dataProvider.dataLoaded.subscribe(r => {
      this.generateChartData(r);
    });
  }

  generateChartData(data: DataPoint[]) {

    if (data.length-1 > 48) {
      this.generateChartData(data.filter(
        function(val, index, data) {
          return (index % Math.ceil((data.length / 48))) === 0;
        }
      ));
      return;
    }

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

}
