import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { WebSocketService } from './web-socket.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {
  HistoryRequestModel,
  HistoryResponseModel,
} from '../../models/history.model';

@Injectable()
export class HistoryService {
  constructor(private wsS: WebSocketService, private http: HttpClient) {}

  public getHistory(
    data: HistoryRequestModel
  ): Observable<HistoryResponseModel> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.wsS.token.access_token}`,
    });

    return this.http
      .get<HistoryResponseModel>(
        'https://platform.fintacharts.com/api/bars/v1/bars/date-range',
        {
          headers,
          params: { ...data, provider: 'oanda' },
        }
      )
      .pipe(
        map((data: any) => {
          let mapData = {
            labels: data.data.map((i: any) => i.t),
            last: data.data.map((i: any) => i.l),
          };
          return mapData;
        })
      );
  }
}
