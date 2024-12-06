import {Component, OnDestroy, OnInit} from '@angular/core';
import { DataproviderService } from '../dataprovider.service';
import { TableModule } from 'primeng/table';
import { DataPoint } from '../../interfaces/dataPoint.interface';
import {DatePipe, NgClass, NgFor} from '@angular/common';
import { TableColumn } from '../../interfaces/tableColumn.interface';
import { DynamicPipe } from '../dynamic.pipe';
import { Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'luis-preview-table',
  standalone: true,
  imports: [TableModule, DatePipe, NgFor, DynamicPipe, NgClass],
  providers: [DatePipe],
  templateUrl: './preview-table.component.html',
  styleUrl: './preview-table.component.scss'
})
export class PreviewTableComponent implements OnInit, OnDestroy {
  data: DataPoint[] = [];
  columns: TableColumn[] = [];

  private unsubscribe$ = new Subject<void>();

  constructor(private dataProvider: DataproviderService) {}

  ngOnInit(): void {
    this.dataProvider.dataLoaded.pipe(takeUntil(this.unsubscribe$)).subscribe(r => {
      this.data = r;
      this.columns = this.getColumns();
    });
  }

  getColumns() {
    return Object.keys(this.data?.[0] ?? {}).map((x,i) => <TableColumn>{ field: x, header: x, pipe: i == 0 ? { type: DatePipe, args: 'dd.MM.yyyy HH:mm' } : undefined });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  isColumnEmpty(value: string): boolean {
    return value === null || value === undefined || value === '';
  }
}
