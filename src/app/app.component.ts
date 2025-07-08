import { Component, OnInit } from '@angular/core';
import { WebSocketService } from './services/web-socket.service';
import { LayoutComponent } from './components/layout/layout.component';

@Component({
  selector: 'app-root',
  imports: [LayoutComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'magnise-test-task';
  data: any = null;

  list: any = null;

  constructor(private wsService: WebSocketService) {}

  ngOnInit() {
    // this.wsService.getToken().subscribe((a) => {
    //   this.wsService.getInstruments(a.access_token).subscribe((i) => {
    //     this.list = i;
    //     console.log(this.list.data);
    //   });
    // this.wsService.connect(a.access_token, '');
    // this.sub = this.wsService.data$.subscribe((data) => {
    //   if (data) {
    //     this.data = {
    //       ask: data.ask,
    //       bid: data.bid,
    //       last: data.last,
    //     };
    //   }
    // });
    // });
  }
}
