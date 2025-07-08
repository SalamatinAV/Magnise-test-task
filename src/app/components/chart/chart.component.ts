import {
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import {
  HistoryRequestModel,
  HistoryResponseModel,
} from '../../../models/history.model';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { provideNativeDateAdapter } from '@angular/material/core';
import { HistoryService } from '../../services/history.service';
import { DatePipe } from '@angular/common';
import { InstrumentModel } from '../../../models/instruments.model';

@Component({
  selector: 'app-chart',
  imports: [
    BaseChartDirective,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatSelectModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  providers: [provideNativeDateAdapter(), DatePipe, HistoryService],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss',
})
export class ChartComponent implements OnChanges, OnInit {
  @Input() instrument!: InstrumentModel;
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  private historyService = inject(HistoryService);
  private datePipe = inject(DatePipe);
  public formGroup!: FormGroup;
  public periodicityItems: { value: string; view: string }[] = [
    { value: 'minute', view: 'Minute' },
    { value: 'hour', view: 'Hour' },
    { value: 'week', view: 'Week' },
    { value: 'month', view: 'Month' },
  ];

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    scales: {
      x: {},
    },
    plugins: {
      legend: {
        display: true,
      },
    },
  };

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{ data: [], label: 'Symbol' }],
  };

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['instrument']) {
      this.formGroup?.enable();
      if (this.instrument && this.formGroup.valid) this.onClick();
    }
  }

  private initForm(): void {
    this.formGroup = new FormGroup({
      startDate: new FormControl(null, Validators.required),
      endDate: new FormControl(null, Validators.required),
      interval: new FormControl(null, Validators.required),
      periodicity: new FormControl(null, Validators.required),
    });

    this.formGroup.disable();
  }

  public onClick(): void {
    let formValue = this.formGroup.value;
    let data: HistoryRequestModel = {
      instrumentId: this.instrument.id,
      ...formValue,
      startDate: this.datePipe.transform(formValue.startDate, 'YYYY-MM-dd'),
      endDate: this.datePipe.transform(formValue.endDate, 'YYYY-MM-dd'),
    };

    this.historyService.getHistory(data).subscribe((data) => {
      this.setData({ ...data, symbol: this.instrument.symbol });
    });
  }

  public setData(data: HistoryResponseModel): void {
    this.barChartData.datasets[0].label = data.symbol;
    this.barChartData.datasets[0].data = data.last;
    this.barChartData.labels = this.formatDate(data.labels);
    this.chart?.update();
  }

  private formatDate(data: string[]) {
    let period = this.formGroup.value.periodicity;
    let format = '';
    return data.map((date: string) => {
      switch (period) {
        case 'minute':
          format = 'ccc HH:mm';
          break;
        case 'hour':
          format = 'ccc h a';
          break;
        case 'week':
          format = 'MMM W';
          break;
        case 'month':
          format = 'YYYY-MMM';
          break;
      }
      return this.datePipe.transform(date, format);
    });
  }
}
