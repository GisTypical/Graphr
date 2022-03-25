import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../../core/services';

@Component({
  selector: 'app-titlebar',
  templateUrl: './titlebar.component.html',
  styleUrls: ['./titlebar.component.scss']
})
export class TitlebarComponent implements OnInit {

  isElectron = false;
  constructor(private electronService: ElectronService) {
    this.isElectron = electronService.isElectron;
  }

  ngOnInit(): void {
  }

  minimizeWindow(): void {
    this.electronService.send('minimizeApp');
  }

  maximizeWindow(): void {
    this.electronService.send('maximizeApp');
  }

  closeWindow(): void {
    this.electronService.send('closeApp');
  }
}
