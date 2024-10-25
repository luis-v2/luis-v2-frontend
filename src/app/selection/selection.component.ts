import { Component, OnInit } from '@angular/core';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { Station } from '../../interfaces/station.interface';
import { DataproviderService } from '../dataprovider.service';
import { FormsModule } from '@angular/forms';
import { StationComponent } from '../../interfaces/station-component.interface';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';

@Component({
  selector: 'luis-selection',
  standalone: true,
  imports: [DropdownModule, FormsModule, MultiSelectModule, ButtonModule, CalendarModule],
  templateUrl: './selection.component.html',
  styleUrl: './selection.component.scss'
})
export class SelectionComponent implements OnInit {
  stations?: Station[];
  selectedStation?: Station;
  selectedComponents?: StationComponent[];
  dateRange?: Date[];
  today?: Date;

  constructor(private dataProvider: DataproviderService) {}

  ngOnInit(): void {
    this.today = new Date();

    this.dataProvider.getAvailableStations().subscribe(r => {
      this.stations = r;
    });
  }

  onStationSelect(e: DropdownChangeEvent) {
    this.selectedComponents = undefined;
    var station = e.value as Station;

    this.dataProvider.getAvailableComponents(station).subscribe(() => {
      // stop loading ?
    });
  }

  gatherData() {
    this.dataProvider.getDataPoints(this.selectedStation!, this.selectedComponents!, this.dateRange!).subscribe();
  }
}
