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
import {DropdownModule} from 'primeng/dropdown';
import {FloatLabelModule} from 'primeng/floatlabel';
import {FormsModule} from '@angular/forms';
import {FileType} from '../interfaces/file-type';

@Component({
  selector: 'luis-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, TopbarComponent, SelectionComponent, PreviewTableComponent, PreviewChartComponent, Button, DropdownModule, FloatLabelModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
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
      monthNamesShort: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
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

  downloadData(fileType: string | undefined):void{
    if (this.dataGathered && fileType != undefined) {
      let blob = new Blob;
      let keysArray = Object.keys(this.dataGathered[0]);
      let fileName = this.createFileName(this.dataGathered)
      console.log(fileName);
      switch (fileType) {
        case 'csv':
          let csvData = this.convertToCSV(this.dataGathered, keysArray);
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
    let firstElement = dataPoints.shift();
    let lastElement = dataPoints.pop();

    return firstElement?.timestamp.toLocaleDateString("en-GB") + "-" + lastElement?.timestamp.toLocaleDateString("en-GB") + "-" + components;
  }
  convertToCSV(objArray:any, headerList:any[]) {
    let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    let str = '';
    let row = '';
    for (let index in headerList) {
      row += headerList[index] + ',';
    }
    row = row.slice(0, -1);
    str += row + '\r\n';
    for (let i = 0; i < array.length; i++) {
      let line = '';
      for (let index in headerList) {
        let head = headerList[index];
        line += array[i][head] +',';
      }
      str += line.slice(0, -1) + '\r\n';
    }
    return str;
  }
}
