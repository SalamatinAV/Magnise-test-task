export interface HistoryResponseModel {
  symbol?: string;
  labels: string[];
  last: number[];
}

export interface HistoryRequestModel {
  instrumentId: string;
  interval: string;
  periodicity: string;
  startDate: string;
  endDate: string;
}
