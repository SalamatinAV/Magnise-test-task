export interface InstrumentsResponseModel {
  data: InstrumentModel[];
}

export interface InstrumentModel {
  id: string;
  symbol: string;
}
