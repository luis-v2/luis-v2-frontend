import { Component, OnDestroy, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { Station } from '../../interfaces/station.interface';
import { DropdownChangeEvent, DropdownModule } from 'primeng/dropdown';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormsModule } from '@angular/forms';
import { DataproviderService } from '../dataprovider.service';
import { Subject, takeUntil } from 'rxjs';
import { Trend } from '../../interfaces/trend.interface';
import { DecimalPipe, NgClass, NgFor } from '@angular/common';
import { Utils } from '../utils';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'luis-trends',
  standalone: true,
  imports: [CardModule, DropdownModule, FloatLabelModule, FormsModule, NgFor, NgClass, DecimalPipe, DialogModule],
  templateUrl: './trends.component.html',
  styleUrl: './trends.component.scss'
})
export class TrendsComponent implements OnInit, OnDestroy {
  stations?: Station[];
  selectedStation?: Station;
  loading: boolean = false;

  timespans: any[] = [
    { label: 'Woche', value: 7},
    { label: 'Monat', value: 30}
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
    this.loading = true;
    this.dataProvider.getTrends(this.selectedStation!, this.selectedTimespan.value).subscribe(r => {
      this.trends = r;
      this.loading = false;
    });
  }

  getDateIntervalLabel() {
    const previousStart = Utils.getDateXDaysAgo(this.selectedTimespan.value * 2);
    const currentStart = Utils.getDateXDaysAgo(this.selectedTimespan.value);
    return `Diese Zeitspanne: ${currentStart} - ${Utils.getDateXDaysAgo(0)}<br/>Letzte Zeitspanne: ${previousStart} - ${currentStart}`;
  }
  
}
