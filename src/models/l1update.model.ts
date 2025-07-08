export interface L1UpdateModel {
  type: string;
  instrumentId: string;
  provider: string;
  ask: PriceUpdate;
  bid: PriceUpdate;
  last: PriceUpdate;
}

interface PriceUpdate {
  timestamp: string;
  price: number;
  volume: number;
}
