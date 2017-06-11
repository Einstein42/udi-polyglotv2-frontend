import { Component, OnInit } from '@angular/core';
import { WebsocketsService } from '../../services/websockets.service';
import { AuthService } from '../../services/auth.service'

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  public polyglot: {
    connected: false
  }

  constructor(
    private sockets: WebsocketsService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.getPolyglot()
  }

  getPolyglot() {
    this.sockets.polyglotData.subscribe(polyglot => this.polyglot = polyglot)
  }

}
