/* eslint-disable max-len */
import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ElectronService } from '../../core/services';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
  @ViewChild('projectButton') public projectButton: ElementRef;
  @ViewChild('projectMenu') projectMenu: ElementRef;
  @ViewChild('moveButton') moveButton: ElementRef;
  @ViewChild('moveMenu') moveMenu: ElementRef;

  isProjectMenuOpen = false;
  isMoveMenuOpen = false;
  isElectron = true;
  canvasRect: DOMRect;

  constructor(
    private renderer: Renderer2,
    private electronService: ElectronService
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

  toggleProjectMenu(): void {
    this.isProjectMenuOpen = !this.isProjectMenuOpen;
  }

  toggleMoveMenu(): void {
    this.isMoveMenuOpen = !this.isMoveMenuOpen;
  }

  // Generate CSS
  generateCSS(canvasChildren): string {
    let css = '';
    for (const element of canvasChildren) {
      const htmlElement = element as HTMLElement;

      this.canvasRect = htmlElement.parentElement.getBoundingClientRect();
      const elementTop = parseInt(htmlElement.style.top, 10);
      const top = elementTop - this.canvasRect.top;

      const elementLeft = parseInt(htmlElement.style.left, 10);
      const left = elementLeft - this.canvasRect.left;

      let elementStyles = htmlElement.style.cssText;
      elementStyles = elementStyles.replace(/top: \d+/, `top: ${top}`);
      elementStyles = elementStyles.replace(/left: \d+/, `left: ${left}`);

      css += `${htmlElement.tagName.toLowerCase()} { ${elementStyles} }\n`;
    }
    return css;
  }

  // Generate HTML
  generateHTML(canvasChildren): string {
    let html = '';
    for (const element of canvasChildren) {
      const htmlElement = element as HTMLElement;
      let elementTag = htmlElement.outerHTML;

      elementTag = elementTag.replace(/style="(\w+:\s?\w+;\s?)*"/, '');
      elementTag = elementTag.replace(/_ngcontent-\w+-\w+=""/, '');
      elementTag = elementTag.replace(/\w+\s\s/, htmlElement.tagName.toLowerCase());

      html += `${elementTag}\n`;
    }
    return html;
  }

  // GENERATE PAGE FILES
  generatePageFiles(): void {
    const canvas = document.getElementsByTagName('app-canvas')[0].children;
    const canvasChildren = Array.from(canvas);
    const css = this.generateCSS(canvasChildren);
    const html = this.generateHTML(canvasChildren);

    this.electronService.invoke('generate', css, html)
    .then(result => console.log(result));
  }
}
