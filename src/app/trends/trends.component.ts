import { Component, OnDestroy, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { Station } from '../../interfaces/station.interface';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';
import { DataproviderService } from '../dataprovider.service';
import { Subject, takeUntil } from 'rxjs';
import { Trend } from '../../interfaces/trend.interface';
import { NgClass, NgFor } from '@angular/common';

@Component({
  selector: 'luis-trends',
  standalone: true,
  imports: [CardModule, DropdownModule, FloatLabelModule, FormsModule, NgFor, NgClass],
  templateUrl: './trends.component.html',
  styleUrl: './trends.component.scss'
})
export class TrendsComponent implements OnInit, OnDestroy {
  stations?: Station[];
  selectedStation?: Station;

  timespans: any[] = [
    { label: 'Woche', value: 'week'},
    { label: 'Monat', value: 'month'}
  ];
  selectedTimespan = this.timespans[0];

  trends?: Trend[];

  private unsubscribe$ = new Subject<void>();

  constructor(private dataProvider: DataproviderService) {}

  ngOnInit(): void {
    this.dataProvider.getAvailableStations().pipe(takeUntil(this.unsubscribe$)).subscribe(r => {
      this.stations = r;

      // preselect "Graz-Don Bosco"
      this.selectedStation = this.stations?.find(x => x.id == 164) ?? this.stations![0];

      this.loadTrends();
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onStationSelect(e: DropdownChangeEvent) {
    this.loadTrends();
  }

  onTimespanSelect(e: DropdownChangeEvent) {
    this.loadTrends();
  }

  loadTrends() {
    // DEMO DATA
    this.dataProvider.getAvailableComponents(this.selectedStation!).pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      this.trends = this.selectedStation?.availableComponents?.map(c => <Trend>{ component: c, previousValue: 10, currentValue: 15});
    });
  }
  
}
