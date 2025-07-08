import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';

import { TokenResponseModel } from '../../models/token.model';
import { L1UpdateModel } from '../../models/l1update.model';
import {
  InstrumentModel,
  InstrumentsResponseModel,
} from '../../models/instruments.model';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private instruments: InstrumentModel[] = [];
  private isOpen: boolean = false;
  private socket!: WebSocket;
  private dataSubject = new BehaviorSubject<L1UpdateModel | null>(null);

  public data$: Observable<L1UpdateModel | null> =
    this.dataSubject.asObservable();
  public token!: TokenResponseModel;

  constructor(private http: HttpClient) {
    this.getToken()
      .pipe(
        switchMap((token) => {
          this.token = token;
          return this.getInstruments();
        })
      )
      .subscribe((instruments) => {
        this.instruments = instruments.data;
        this.connect(this.token.access_token);
      });
  }

  private getToken(): Observable<TokenResponseModel> {
    const body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('client_id', 'app-cli');
    body.set('username', 'r_test@fintatech.com');
    body.set('password', 'kisfiz-vUnvy9-sopnyv');

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http.post<TokenResponseModel>(
      '/api-auth/identity/realms/fintatech/protocol/openid-connect/token',
      body.toString(),
      { headers }
    );
  }

  private getInstruments(): Observable<InstrumentsResponseModel> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token.access_token}`,
    });

    return this.http.get<InstrumentsResponseModel>(
      'https://platform.fintacharts.com/api/instruments/v1/instruments?provider=oanda&kind=forex',
      { headers }
    );
  }

  public sendData(id: string): void {
    if (this.isOpen) {
      const subscribeMessage = {
        type: 'l1-subscription',
        id: '1',
        instrumentId: id,
        provider: 'oanda',
        subscribe: true,
        kinds: ['ask', 'bid', 'last'],
      };

      this.socket.send(JSON.stringify(subscribeMessage));
    }
  }

  public connect(token: string): void {
    const url = `wss://platform.fintacharts.com/api/streaming/ws/v1/realtime?token=${token}`;
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.isOpen = true;
      console.log('WebSocket connected');
    };

    this.socket.onerror = (error) => {
      this.isOpen = false;
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = () => {
      this.isOpen = false;
      console.log('WebSocket disconnected');
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'l1-update') this.dataSubject.next(data);
    };
  }

  public unsubscribeInstrument(id: string): void {
    const unsubscribeMessage = {
      type: 'l1-subscription',
      id: '1',
      instrumentId: id,
      provider: 'oanda',
      subscribe: false,
      kinds: ['ask', 'bid', 'last'],
    };

    this.socket?.send(JSON.stringify(unsubscribeMessage));
  }

  public getInstrumenItems(): InstrumentModel[] {
    return this.instruments;
  }
}
