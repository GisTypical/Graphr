/* eslint-disable @typescript-eslint/prefer-for-of */
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

      const computedCss = getComputedStyle(htmlElement);
      const styles = `background-color: ${computedCss.backgroundColor};
      color: ${computedCss.color};
      font-family: ${computedCss.fontFamily};
      width: ${computedCss.width};
      padding: ${computedCss.padding};
      border-radius: ${computedCss.borderRadius};`;

      console.log(styles);

      this.canvasRect = htmlElement.parentElement.getBoundingClientRect();
      const elementTop = parseInt(htmlElement.style.top, 10);
      const top = elementTop - this.canvasRect.top;

      const elementLeft = parseInt(htmlElement.style.left, 10);
      const left = elementLeft - this.canvasRect.left;

      let elementStyles = styles + htmlElement.style.cssText;
      elementStyles = elementStyles.replace(/top: \d+/, `top: ${top}`);
      elementStyles = elementStyles.replace(/left: \d+/, `left: ${left}`);

      css += `${htmlElement.tagName.toLowerCase()} { ${elementStyles} }\n`;
      console.log(css);
    }
    return css;
  }

  // Generate HTML
  generateHTML(canvasChildren): string {
    let html = '';

    for (let index = 0; index < canvasChildren.length; index++) {
      const htmlElement = canvasChildren[index] as HTMLElement;
      let elementTag = htmlElement.outerHTML;
      const innerContent = htmlElement.innerHTML;
      const cssText = htmlElement.style.cssText;

      elementTag = elementTag.replace(`style="${cssText}"`, '');
      elementTag = elementTag.replace(/_ngcontent-\w+-\w+=""/, '');
      elementTag = elementTag.replace(/contenteditable="\w*"/, '');
      elementTag = elementTag.replace(/spellcheck="\w*"/, '');
      elementTag = elementTag.replace(/class="(\w*\-?\w*\s?)*"/, '');
      elementTag = elementTag.replace(/open="\w*"/, '');
      elementTag = elementTag.replace(/novalidate=""/, '');

      elementTag = elementTag.replace(/\w+\s*/, htmlElement.tagName.toLowerCase());
      elementTag = elementTag.replace(/type=/, ' type=');

      if (htmlElement.children.length > 0) {
        elementTag = elementTag.replace(innerContent, '');
        elementTag = elementTag.replace(/>/, `>${this.generateHTML(htmlElement.children)}`);
      }

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
    const pageTitle = document.querySelector('.title h1').textContent;

    this.electronService.invoke('generate', css, html, pageTitle)
    .then(result => console.log(result));
  }
}
