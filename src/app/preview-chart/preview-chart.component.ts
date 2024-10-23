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
  data: DataPoint[] = [];

  constructor(private dataProvider: DataproviderService) {}

  ngOnInit(): void {
    this.dataProvider.getDemoDataHTML().subscribe(r => {
      this.data = r;
    });
  }

  generateChartData() {
    var d = {
      labels: this.data.map(x => x.timestamp.toLocaleDateString(undefined, { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'})),
      datasets: <any>[]
    };

    Object.keys(this.data?.[0] ?? {}).slice(1).forEach(key => {
      d.datasets.push({
        label: key,
        data: this.data.map(x => x[key]),
        fill: false
      });
    });

    return d;
  }

}
