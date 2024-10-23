import { Component, OnInit } from '@angular/core';
import { DataproviderService } from '../dataprovider.service';
import { TableModule } from 'primeng/table';
import { DataPoint } from '../../interfaces/dataPoint.interface';
import { DatePipe, NgFor } from '@angular/common';
import { TableColumn } from '../../interfaces/tableColumn.interface';
import { DynamicPipe } from '../dynamic.pipe';

@Component({
  selector: 'luis-preview-table',
  standalone: true,
  imports: [TableModule, DatePipe, NgFor, DynamicPipe],
  providers: [DatePipe],
  templateUrl: './preview-table.component.html',
  styleUrl: './preview-table.component.scss'
})
export class PreviewTableComponent implements OnInit {
  data: DataPoint[] = [];

  constructor(private dataProvider: DataproviderService) {}

  ngOnInit(): void {
    this.dataProvider.dataLoaded.subscribe(r => {
      this.data = r;
    });
  }

  getColumns() {
    return Object.keys(this.data?.[0] ?? {}).map((x,i) => <TableColumn>{ field: x, header: x, pipe: i == 0 ? { type: DatePipe, args: 'dd.MM.yyyy hh:mm' } : undefined });
  }

}
