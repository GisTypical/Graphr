/* eslint-disable max-len */
import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ElectronService } from '../../core/services';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
  @ViewChild('projectButton') projectButton: ElementRef;
  @ViewChild('projectMenu') projectMenu: ElementRef;
  @ViewChild('moveButton') moveButton: ElementRef;
  @ViewChild('moveMenu') moveMenu: ElementRef;

  isProjectMenuOpen = false;
  isMoveMenuOpen = false;
  isElectron: boolean;

  constructor(
    private electronService: ElectronService,
    private renderer: Renderer2
  ) {
    this.renderer.listen('window', 'click', (e: Event) => {
      if (this.projectButton && this.projectMenu) {
        if (!this.projectButton.nativeElement.contains(e.target) && !this.projectMenu.nativeElement.contains(e.target)) {
          this.isProjectMenuOpen = false;
        }
      } else if (this.moveButton && this.moveMenu) {
        if (!this.moveButton.nativeElement.contains(e.target) && !this.moveMenu.nativeElement.contains(e.target)) {
          this.isMoveMenuOpen = false;
        }
      }
    });
  }

  ngOnInit(): void {
    this.isElectron = this.electronService.isElectron;
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

  toggleProjectMenu(): void {
    this.isProjectMenuOpen = !this.isProjectMenuOpen;
  }

  toggleMoveMenu(): void {
    this.isMoveMenuOpen = !this.isMoveMenuOpen;
  }

}
