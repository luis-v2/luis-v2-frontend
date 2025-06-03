import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataproviderService } from '../dataprovider.service';
import { TopbarComponent } from '../topbar/topbar.component';
import { SelectionComponent } from "../selection/selection.component";
import { PreviewTableComponent } from "../preview-table/preview-table.component";
import { PreviewChartComponent } from "../preview-chart/preview-chart.component";
import { PrimeNGConfig } from 'primeng/api';
import {Button} from 'primeng/button';
import {Subject, takeUntil} from 'rxjs';
import {DataPoint} from '../../interfaces/dataPoint.interface';
import {DropdownModule} from 'primeng/dropdown';
import {FloatLabelModule} from 'primeng/floatlabel';
import {FormsModule} from '@angular/forms';
import {FileType} from '../../interfaces/file-type';
import { ToastModule } from 'primeng/toast';
import * as Papa from 'papaparse';

@Component({
  selector: 'luis-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TopbarComponent,
    SelectionComponent,
    PreviewTableComponent,
    PreviewChartComponent,
    Button,
    DropdownModule,
    FloatLabelModule,
    FormsModule,
    ToastModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent  implements OnInit {
  @ViewChild('container') container!: ElementRef;
  title = 'luis-v2';
  stations: Map<string,string> = new Map();
  components: Map<string, string> = new Map();
  dataGathered?: DataPoint[];
  fileTypes?: FileType[];
  selectedFiletype?: FileType;

  private unsubscribe$ = new Subject<void>();

  constructor(private primeNgConfig: PrimeNGConfig,private dataProvider: DataproviderService) {}

  ngOnInit(): void {
    this.primeNgConfig.setTranslation({
      firstDayOfWeek: 1,
      dayNamesMin: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
      monthNames: ['Jänner', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
      monthNamesShort: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
    });
    this.fileTypes = [
      { name: 'JSON', code: 'json'},
      { name: 'CSV', code: 'csv'},
    ];
    this.selectedFiletype =  { name: 'JSON', code: 'json'};

    this.dataProvider.dataLoaded.pipe(takeUntil(this.unsubscribe$)).subscribe(r => {
      this.dataGathered = r;
    });
  }

  @HostListener("window:resize", ['$event'])
  onWindowResize(event: any) {
    let row = document.querySelectorAll('.grid > .row');
    let selection = row[0] as HTMLElement;
    let previews = row[1] as HTMLElement;

    previews.style.setProperty('height', `calc(100% - ${selection.offsetHeight}px)`);
  }

  downloadData(fileType: string | undefined):void{
    if (this.dataGathered && fileType != undefined) {
      let blob = new Blob;
      let fileName = this.createFileName(this.dataGathered)
      switch (fileType) {
        case 'csv':
          let csvData  = Papa.unparse(this.dataGathered,{delimiter: ";"});
          blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
          break;
        default:
        case 'json':
          let jsonString = JSON.stringify(this.dataGathered);
          blob = new Blob([jsonString], {type: 'application/json'});
      }
      this.downloadFile(blob, fileType, fileName);
    }
  }

  downloadFile(file:Blob, fileType:String, fileName:String|undefined):void{
    let url = window.URL.createObjectURL(file);
    let a = document.createElement('a');
    if(fileName == undefined){
      fileName = "Download";
    }
    a.href = url;
    a.download = fileName +'.'+fileType;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  createFileName(dataPoints:DataPoint[]):string {
    let keysArray = Object.keys(dataPoints[0]);
    keysArray.shift();
    let components = keysArray.join("_");
    let firstElement = dataPoints[0];
    let lastElement = dataPoints[dataPoints.length - 1];

    return firstElement?.timestamp.toLocaleDateString("en-GB") + "-" + lastElement?.timestamp.toLocaleDateString("en-GB") + "-" + components;
  }
}
