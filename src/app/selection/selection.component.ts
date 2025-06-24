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
import { DialogModule } from 'primeng/dialog';
import {FloatLabelModule} from 'primeng/floatlabel';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'luis-selection',
  standalone: true,
  imports: [DropdownModule, FormsModule, MultiSelectModule, ButtonModule, CalendarModule, FloatLabelModule, DialogModule, CheckboxModule, TooltipModule],
  templateUrl: './selection.component.html',
  styleUrl: './selection.component.scss'
})
export class SelectionComponent implements OnInit, OnDestroy {
  stations?: Station[];
  selectedStation?: Station;
  selectedComponents?: StationComponent[];
  dateRange?: Date[];
  maxDate?: Date;
  averageOptions?: Average[];
  selectedAverage?: Average;
  interpolate?: boolean = false;
  loading: boolean = false;

  private unsubscribe$ = new Subject<void>();

  constructor(private dataProvider: DataproviderService) {}

  ngOnInit(): void {
    this.maxDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

    this.dataProvider.getAvailableStations().pipe(takeUntil(this.unsubscribe$)).subscribe(r => {
      this.stations = r;

      this.preloadDemoData();
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

    this.dataProvider.getAvailableComponents(station).pipe(takeUntil(this.unsubscribe$)).pipe(takeUntil(this.unsubscribe$)).subscribe();
  }

  gatherData() {
    this.loading = true;
    this.dataProvider.getDataPoints(this.selectedStation!, this.selectedComponents!, this.dateRange!, this.selectedAverage!, this.interpolate!).pipe(takeUntil(this.unsubscribe$)).subscribe(r => {
      this.loading = false;
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  preloadDemoData() {
    // preselect "Graz-Don Bosco"
    this.selectedStation = this.stations?.find(x => x.id == 164) ?? this.stations![0];

    // set default date range
    this.dateRange = [new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date(new Date().setHours(0,0,0,0))];

    // get components for preselected station
    this.dataProvider.getAvailableComponents(this.selectedStation).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      // select components: 125 = pm10, 8 = lute, 29 = co
      this.selectedComponents = this.selectedStation?.availableComponents?.filter(x => [125, 8, 29].includes(x.id));

      if (this.selectedComponents && this.selectedComponents.length > 0) this.gatherData();
    });
  }

}
