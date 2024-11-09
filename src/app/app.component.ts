import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { DataproviderService } from './dataprovider.service';
import { TopbarComponent } from './topbar/topbar.component';
import { SelectionComponent } from "./selection/selection.component";
import { PreviewTableComponent } from "./preview-table/preview-table.component";
import { PreviewChartComponent } from "./preview-chart/preview-chart.component";
import { PrimeNGConfig } from 'primeng/api';
import {Button} from 'primeng/button';
import {Subject, takeUntil} from 'rxjs';
import {DataPoint} from '../interfaces/dataPoint.interface';

@Component({
  selector: 'luis-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, TopbarComponent, SelectionComponent, PreviewTableComponent, PreviewChartComponent, Button],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  @ViewChild('container') container!: ElementRef;
  title = 'luis-v2';
  stations: Map<string,string> = new Map();
  components: Map<string, string> = new Map();
  dataGathered?: DataPoint[];

  private unsubscribe$ = new Subject<void>();

  constructor(private primeNgConfig: PrimeNGConfig,private dataProvider: DataproviderService) {}

  ngOnInit(): void {
    this.primeNgConfig.setTranslation({
      firstDayOfWeek: 1,
      dayNamesMin: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
      monthNames: ['Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
      monthNamesShort: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
    });

    this.dataProvider.dataLoaded.pipe(takeUntil(this.unsubscribe$)).subscribe(r => {
      this.dataGathered = r;
    });
  }

  downloadData(fileType:String):void{
    if(this.dataGathered){
      let blob = null;
      switch (fileType) {
        default:
        case 'json':
          let jsonString = JSON.stringify(this.dataGathered);
          blob = new Blob([jsonString], {type: 'application/json'});
      }
      this.downloadFile(blob, fileType);
    }
  }

  downloadFile(file:Blob, fileType:String){
    let url = window.URL.createObjectURL(file);
    let a = document.createElement('a');
    a.href = url;
    a.download = 'download.'+fileType;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
