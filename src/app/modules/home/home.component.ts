import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from '../../core/services';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  pong: boolean;

  constructor(private electron: ElectronService) {}

  ngOnInit(): void {
    console.log('HomeComponent INIT');
  }

  sendPing(message: string) {
    console.log('sending ping...');
    this.electron.send('ping', message);
  }

  async invoke() {
    const response = await this.electron.invoke('pong');
    this.pong = Boolean(response);
  }
}
