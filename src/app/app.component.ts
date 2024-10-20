import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { DataproviderService } from './dataprovider.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  @ViewChild('container') container!: ElementRef;
  title = 'luis-v2';
  stations: Map<string,string> = new Map();

  constructor(private dataProvider: DataproviderService) {}

  ngOnInit(): void {
    this.dataProvider.getDemoDataHTML().subscribe(r => {
      this.container.nativeElement.innerHTML = r;
    });
    this.dataProvider.getAvailableStations().subscribe(
      (html: string) => {
        this.stations = this.dataProvider.parseStations(html);
        console.log("INLV Start:");
        console.log(this.stations);
        console.log("INLV Stop");

      }
    )
  }

 addStation(key: string, value: string) {
    this.stations.set(key, value);
 }
}
