import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { ChartComponent } from '../chart/chart.component';
import { WebSocketService } from '../../services/web-socket.service';
import { HistoryResponseModel } from '../../../models/history.model';
import { InstrumentModel } from '../../../models/instruments.model';
import { marketDataModel } from '../../../models/market-data.model';

@Component({
  selector: 'app-layout',
  imports: [
    MatSelectModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    MatTableModule,
    ChartComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  public selectedValue: InstrumentModel | null = null;
  public instrument: InstrumentModel | null = null;
  public marketData: marketDataModel[] = [];
  public displayedColumns: string[] = ['symbol', 'price', 'date'];
  public history!: HistoryResponseModel;
  private unSubId: string = '';

  constructor(public wsService: WebSocketService) {}

  public subscriptionData() {
    if (!this.selectedValue) return;
    this.instrument = this.selectedValue;
    this.initWsData(this.selectedValue);
    this.wsService.sendData(this.selectedValue.id);
    if (this.unSubId) this.wsService.unsubscribeInstrument(this.unSubId);
    this.unSubId = this.selectedValue.id;
    this.marketData = [];
  }

  private initWsData(instrument: InstrumentModel): void {
    this.wsService.data$.subscribe((data) => {
      if (data) {
        const obj = {
          symbol: instrument.symbol,
          date: data.last.timestamp,
          price: data.last.price,
        };
        this.marketData = [obj];
      }
    });
  }
}
