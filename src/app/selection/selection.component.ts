import {Component, OnDestroy, OnInit} from '@angular/core';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { Station } from '../../interfaces/station.interface';
import { DataproviderService } from '../dataprovider.service';
import { FormsModule } from '@angular/forms';
import { StationComponent } from '../../interfaces/station-component.interface';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { Average} from '../../interfaces/average.interface';
import {Subject, takeUntil} from 'rxjs';
import {FloatLabelModule} from 'primeng/floatlabel';

@Component({
  selector: 'luis-selection',
  standalone: true,
  imports: [DropdownModule, FormsModule, MultiSelectModule, ButtonModule, CalendarModule, FloatLabelModule],
  templateUrl: './selection.component.html',
  styleUrl: './selection.component.scss'
})
export class SelectionComponent implements OnInit, OnDestroy {
  stations?: Station[];
  selectedStation?: Station;
  selectedComponents?: StationComponent[];
  dateRange?: Date[];
  today?: Date;
  averageOptions?: Average[];
  selectedAverage?: Average;

  private unsubscribe$ = new Subject<void>();

  constructor(private dataProvider: DataproviderService) {}

  ngOnInit(): void {
    this.today = new Date();

    this.dataProvider.getAvailableStations().pipe(takeUntil(this.unsubscribe$)).subscribe(r => {
      this.stations = r;
    });

    // can be loaded at the start, since not depending on selected Station.
    this.dataProvider.getAvailableAverages().pipe(takeUntil(this.unsubscribe$)).subscribe(r => {
      this.averageOptions = r;

      // set default average to first entry, because original luis has same handling
      this.selectedAverage = r[0];
    });
  }

  onStationSelect(e: DropdownChangeEvent) {
    this.selectedComponents = undefined;
    var station = e.value as Station;

    this.dataProvider.getAvailableComponents(station).pipe(takeUntil(this.unsubscribe$)).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      // stop loading ?
    });
  }

  gatherData() {
    this.dataProvider.getDataPoints(this.selectedStation!, this.selectedComponents!, this.dateRange!, this.selectedAverage!).pipe(takeUntil(this.unsubscribe$)).subscribe();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
