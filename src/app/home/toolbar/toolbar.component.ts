/* eslint-disable object-shorthand */
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
  generateCSS(canvasChildren, cssRules): string {
    let css = '';

    for (let index = 0; index < canvasChildren.length; index++) {
      const htmlElement = canvasChildren[index] as HTMLElement;
      let elementRules = '';

      for (let j = 0; j < cssRules.length; j++) {
        let rule = cssRules[j].cssText;
        rule = rule.replace(cssRules[j].selectorText, '');
        rule = rule.replace('{ ', '');
        rule = rule.replace(' }', '');

        const tagName = htmlElement.tagName;
        const parentTagName = htmlElement.parentElement.tagName;

        // Adding default styles to the css rule
        switch (true) {
          case tagName === 'DIV' && cssRules[j].selectorText === 'div.default-style':
            elementRules += rule;
            break;
          case tagName === 'BUTTON' && cssRules[j].selectorText === 'button.default-style':
            elementRules += rule;
            break;
          case tagName === 'HR' && cssRules[j].selectorText === 'hr.default-style':
            elementRules += rule;
            break;
          case tagName === 'FIGURE' && cssRules[j].selectorText === 'figure.default-style':
            elementRules += rule;
            break;
          case tagName === 'IMG' && cssRules[j].selectorText === 'img.default-style':
            elementRules += rule;
            break;
          case tagName === 'DETAILS' && cssRules[j].selectorText === 'details.default-style':
            elementRules += rule;
            break;
          case parentTagName === 'DETAILS' && tagName === 'P' && cssRules[j].selectorText === 'details.default-style > p':
            elementRules += rule;
            break;
          case tagName === 'H1' && cssRules[j].selectorText === 'h1.default-style':
            elementRules += rule;
            break;
          case parentTagName === 'APP-CANVAS' && tagName === 'P' && cssRules[j].selectorText === 'p.default-style, span.default-style':
            elementRules += rule;
            break;
          case parentTagName === 'APP-CANVAS' && tagName === 'SPAN' && cssRules[j].selectorText === 'p.default-style, span.default-style':
            elementRules += rule;
            break;
          case tagName === 'CODE' && cssRules[j].selectorText === 'code.default-style':
            elementRules += rule;
            break;
          case tagName === 'BLOCKQUOTE' && cssRules[j].selectorText === 'blockquote.default-style':
            elementRules += rule;
            break;
          case tagName === 'UL' && cssRules[j].selectorText === 'ul.default-style, ol.default-style':
            elementRules += rule;
            break;
          case tagName === 'OL' && cssRules[j].selectorText === 'ul.default-style, ol.default-style':
            elementRules += rule;
            break;
          case parentTagName === 'UL' && tagName === 'LI' && cssRules[j].selectorText === 'ul.default-style > li, ol.default-style > li':
            elementRules += rule;
            break;
          case parentTagName === 'OL' && tagName === 'LI' && cssRules[j].selectorText === 'ul.default-style > li, ol.default-style > li':
            elementRules += rule;
            break;
          case tagName === 'FORM' && cssRules[j].selectorText === 'form.default-style':
            elementRules += rule;
            break;
          case tagName === 'INPUT' && htmlElement.getAttribute('type') !== 'color' &&
            cssRules[j].selectorText === 'input.default-style, textarea.default-style, select.default-style, option.default-style':
            elementRules += rule;
            break;
          case tagName === 'TEXTAREA' && cssRules[j].selectorText === 'input.default-style, textarea.default-style, select.default-style, option.default-style':
            elementRules += rule;
            break;
          case tagName === 'SELECT' && cssRules[j].selectorText === 'input.default-style, textarea.default-style, select.default-style, option.default-style':
            elementRules += rule;
            break;
          case tagName === 'OPTION' && cssRules[j].selectorText === 'input.default-style, textarea.default-style, select.default-style, option.default-style':
            elementRules += rule;
            break;
          case tagName === 'LABEL' && cssRules[j].selectorText === 'label.default-style':
            elementRules += rule;
            break;
          case parentTagName === 'LABEL' && tagName === 'INPUT' &&
            cssRules[j].selectorText === 'input[type="checkbox"].default-style, input[type="radio"].default-style':
            elementRules += rule;
            break;
          case tagName === 'INPUT' && htmlElement.getAttribute('type') === 'color' && cssRules[j].selectorText === 'input[type="color"].default-style':
            elementRules += rule;
            break;
          default:
            break;
        }
      }

      this.canvasRect = htmlElement.parentElement.getBoundingClientRect();
      const elementTop = parseInt(htmlElement.style.top, 10);
      const top = elementTop - this.canvasRect.top;

      const elementLeft = parseInt(htmlElement.style.left, 10);
      const left = elementLeft - this.canvasRect.left;

      let elementStyles = htmlElement.style.cssText;
      elementStyles = elementStyles.replace(/top: \d+/, `top: ${top}`);
      elementStyles = elementStyles.replace(/left: \d+/, `left: ${left}`);
      elementStyles += 'transition: filter 0.2s ease-in-out 0s, border-color 0.2s ease-in-out 0s, background-color 0.2s ease-in-out 0s;';

      if (htmlElement.classList.contains('hover')) {
        let hoverNot = cssRules[38].cssText;
        hoverNot = hoverNot.replace(cssRules[38].selectorText, '');
        hoverNot = hoverNot.replace('{', '');
        hoverNot = hoverNot.replace('}', '');

        css += `#${htmlElement.id}${cssRules[38].selectorText} { ${hoverNot} }`;
      }

      if (htmlElement.classList.contains('active')) {
        let active = cssRules[39].cssText;

        active = active.replace(cssRules[39].selectorText, '');
        active = active.replace('{', '');
        active = active.replace('}', '');

        css += `#${htmlElement.id}${cssRules[39].selectorText} { ${active} }`;
      }

      if (htmlElement.classList.contains('focus')) {
        let focus = cssRules[40].cssText;

        focus = focus.replace(cssRules[40].selectorText, '');
        focus = focus.replace('{', '');
        focus = focus.replace('}', '');

        css += `#${htmlElement.id}${cssRules[40].selectorText} { ${focus} }`;
      }

      if (htmlElement.children.length > 0) {
        css += `#${htmlElement.id} { ${elementRules}\n${elementStyles} }\n${this.generateCSS(htmlElement.children, cssRules)}`;
      } else {
        css += `#${htmlElement.id} { ${elementRules}\n${elementStyles} }\n`;
      }

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

      if (htmlElement.children.length > 0) {
        elementTag = elementTag.replace(innerContent, '');
        elementTag = elementTag.replace(/>/, `>${this.generateHTML(htmlElement.children)}`);
      }

      elementTag = elementTag.replace(/ng-untouched ng-pristine ng-val\s*id/, '');
      elementTag = elementTag.replace(/_ngcontent-\w+-\w+=""/, '');
      elementTag = elementTag.replace(`style="${cssText}"`, '');
      elementTag = elementTag.replace(/contenteditable="\w*"/, '');
      elementTag = elementTag.replace(/spellcheck="\w*"/, '');
      elementTag = elementTag.replace('default-style', '');
      elementTag = elementTag.replace('selected', '');
      elementTag = elementTag.replace(/open="\w*"/, '');
      elementTag = elementTag.replace(/novalidate=""/, '');

      elementTag = elementTag.replace(/\w+\s*/, htmlElement.tagName.toLowerCase());
      elementTag = elementTag.replace('" ', '"');
      elementTag = elementTag.replace('class', ' class');
      elementTag = elementTag.replace('type=', ' type=');
      elementTag = elementTag.replace('id', ' id');
      elementTag = elementTag.replace('for=', ' for=');
      elementTag = elementTag.replace('src', ' src');
      elementTag = elementTag.replace('name', ' name');

      html += `${elementTag}\n`;
    }
    return html;
  }

  // GENERATE PAGE FILES
  generatePageFiles(): void {
    const stylesheet: any = document.styleSheets[5].cssRules;
    const cssRules = [];

    for (let index = 0; index < stylesheet.length; index++) {
      let rule = stylesheet[index].cssText;
      rule = rule.replace(/\[_ngcontent-\w*-\w*\]/g, '');

      // Colors
      rule = rule.replace('var(--winter-sky)', '#f52276');
      rule = rule.replace('var(--plum-web)', '#f0a5f1');
      rule = rule.replace('var(--columbia-blue)', '#ccecfc');
      rule = rule.replace('var(--dogwood-rose)', '#d61b66');
      rule = rule.replace('var(--french-mauve)', '#d895da');
      rule = rule.replace('var(--pewter-blue)', '#a9c6d3');
      rule = rule.replace('var(--dark-purple)', '#3a2d46');
      rule = rule.replace('var(--english-violet)', '#4c4057');
      rule = rule.replace('var(--independence)', '#5c5166');
      rule = rule.replace('var(--dark-liver)', '#2b2134');
      rule = rule.replace('var(--black)', '#000000');
      rule = rule.replace('var(--mid-grey)', '#bbbbbb');
      rule = rule.replace('var(--light-grey)', '#eeeeee');
      rule = rule.replace('var(--white)', '#ffffff');

      let selectorText = stylesheet[index].selectorText;
      selectorText = selectorText.replace(/\[_ngcontent-\w*-\w*\]/g, '');

      cssRules.push({
        cssText: rule,
        selectorText: selectorText
      });
    }

    const canvas = document.getElementsByTagName('app-canvas')[0].children;
    const canvasChildren = Array.from(canvas);
    const css = this.generateCSS(canvasChildren, cssRules);
    const html = this.generateHTML(canvasChildren);
    const pageTitle = document.querySelector('.title h1').textContent;

    this.electronService.invoke('generate', css, html, pageTitle)
      .then(result => console.log(result));
  }
}
