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
  components: Map<string, string> = new Map();

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


  onStationSelected(event: Event) {
    const target = event.target as HTMLSelectElement; // Cast event.target to HTMLSelectElement
    const selectedStationId = target.value; // Now it's safe to access value
    console.log('Selected Station ID:', selectedStationId);

    const stationValue = this.stations.get(selectedStationId); // Get the station name from the Map

    if (stationValue) {
      this.dataProvider.getAvailableComponents(stationValue).subscribe(
        (html: string) => {
          this.components = this.dataProvider.parseComponentsForSelectedStation(html);
        },
      );
    }
  }
}
