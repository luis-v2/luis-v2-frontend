import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { DataproviderService } from './dataprovider.service';
import { TopbarComponent } from './topbar/topbar.component';
import { SelectionComponent } from "./selection/selection.component";
import { PreviewTableComponent } from "./preview-table/preview-table.component";
import { PreviewChartComponent } from "./preview-chart/preview-chart.component";
import { PrimeNGConfig } from 'primeng/api';

@Component({
  selector: 'luis-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, TopbarComponent, SelectionComponent, PreviewTableComponent, PreviewChartComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  @ViewChild('container') container!: ElementRef;
  title = 'luis-v2';
  stations: Map<string,string> = new Map();
  components: Map<string, string> = new Map();

  constructor(private primeNgConfig: PrimeNGConfig) {}

  ngOnInit(): void {
    this.primeNgConfig.setTranslation({
      firstDayOfWeek: 1,
      dayNamesMin: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
      monthNames: ['Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
      monthNamesShort: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
    });
  }
}
