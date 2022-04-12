import { Component, OnInit, Renderer2 } from '@angular/core';
import { SelectedElementsService } from '../../core/services/selected-elements/selected-elements.service';
import ElementAttributes from '../../shared/interfaces/element-attributes';
import getRgbAlpha from '../../shared/utils/get-rgb-alpha';
import rgb2hex from '../../shared/utils/rgb2hex';

@Component({
  selector: 'app-styles-bar',
  templateUrl: './styles-bar.component.html',
  styleUrls: ['./styles-bar.component.scss'],
})
export class StylesBarComponent implements OnInit {
  selectedElement: HTMLElement;
  canvasRect: DOMRect;
  elementAtt: ElementAttributes = {} as ElementAttributes;

  constructor(
    private selectedService: SelectedElementsService,
    private renderer: Renderer2
  ) {
    // Receive last selected element
    this.selectedService.currentSelected.subscribe((value) => {
      this.selectedElement = value[value.length - 1];

      if (!this.isElementSelected()) {
        return;
      }

      this.canvasRect =
        this.selectedElement.parentElement.getBoundingClientRect();

      // Get selected element properties
      this.getElementAttributes();
    });
  }

  ngOnInit(): void { }

  getElementAttributes() {
    const elementLeft = parseInt(this.selectedElement.style.left, 10);
    this.elementAtt.x = elementLeft - Math.round(this.canvasRect.left);

    const elementTop = parseInt(this.selectedElement.style.top, 10);
    this.elementAtt.y = elementTop - Math.round(this.canvasRect.top);

    this.elementAtt.width = this.selectedElement.offsetWidth;

    this.elementAtt.height = this.selectedElement.offsetHeight;

    this.elementAtt.color = rgb2hex(this.getComputedStyle('color'));

    this.elementAtt.rotation = this.selectedElement.style.transform
      ? parseInt(this.selectedElement.style.transform.match(/-?\d+deg/gm)[0], 10)
      : 0;

    this.elementAtt.borderRadius = parseInt(
      this.getComputedStyle('borderRadius'),
      10
    );

    this.elementAtt.hasFill = this.getComputedStyle('backgroundColor') !== 'rgba(0, 0, 0, 0)';

    this.elementAtt.bgColor = rgb2hex(this.getComputedStyle('backgroundColor'));

    this.elementAtt.borderColor = rgb2hex(this.getComputedStyle('borderColor'));

    this.elementAtt.borderStyle = this.getComputedStyle('borderStyle');

    this.elementAtt.hasBorder = this.elementAtt.borderStyle !== 'none';

    this.elementAtt.borderWidth = parseInt(
      this.getComputedStyle('borderWidth'),
      10
    );

    this.elementAtt.opacity = +this.getComputedStyle('opacity') * 100;

    this.elementAtt.zIndex = +this.selectedElement.style.zIndex;

    this.elementAtt.hasBoxShadow = this.getComputedStyle('boxShadow') !== 'none';

    const boxShadow = this.getComputedStyle('boxShadow');

    // Get BoxShadow without rgb
    if (boxShadow !== 'none') {
      const boxShadowNoRGB = boxShadow.replace(/^rgb(a)?\(\d{1,3}, \d{1,3}, \d{1,3}(, \d+\.?\d*)?\)/gm, '');

      const [, offsetX, offsetY, shadowBlur, spread] = boxShadowNoRGB.split(' ');

      this.elementAtt.shadowX = parseInt(offsetX, 10);

      this.elementAtt.shadowY = parseInt(offsetY, 10);

      this.elementAtt.shadowBlur = parseInt(shadowBlur, 10);

      this.elementAtt.shadowSpread = parseInt(spread, 10);

      const rgba = boxShadow.match(/^rgb(a)?\(\d{1,3}, \d{1,3}, \d{1,3}(, \d+\.?\d*)?\)/gm)[0];
      const [rgb, alpha] = getRgbAlpha(rgba);
      this.elementAtt.shadowColor = rgb2hex(rgb);

      this.elementAtt.shadowAlpha = Math.round(+alpha * 100);
    }

    const blur = this.getComputedStyle('filter');

    this.elementAtt.hasBlur = blur !== 'none';
    this.elementAtt.blur = this.elementAtt.hasBlur ? parseInt(blur.match(/\d+/gm)[0], 10) : 0;
  }

  isElementSelected(): boolean {
    return this.selectedElement !== undefined;
  }

  getComputedStyle(style: string): string {
    return window.getComputedStyle(this.selectedElement)[style];
  }

  changePos({ target: input }) {
    // Get input data
    const posValue = parseInt(input.value, 10);
    // Axis depending of the input name (top | left)
    const axis = input.name;

    // Parent value for top or left
    const canvasValue = this.canvasRect[axis];

    this.renderer.setStyle(
      this.selectedElement,
      axis,
      `${canvasValue + posValue}px`
    );
  }

  changeValue({ target: input }) {
    // Refactor this into another file
    const pixelBased = ['width', 'height', 'border-radius', 'border-width'];
    const degBased = ['rotation'];
    const percentBased = ['opacity'];

    // Element attribute that's being changed
    const attribute = input.name;

    if (pixelBased.indexOf(attribute) !== -1) {
      const valuePx = parseInt(input.value, 10);
      this.renderer.setStyle(this.selectedElement, attribute, `${valuePx}px`);
      return;
    }
    if (degBased.indexOf(attribute) !== -1) {
      const valueDeg = `rotate(${input.value}deg)`;
      this.renderer.setStyle(this.selectedElement, 'transform', valueDeg);
      return;
    }
    if (percentBased.indexOf(attribute) !== -1) {
      const valuePercent = `${input.value}%`;
      this.renderer.setStyle(this.selectedElement, attribute, valuePercent);
      return;
    }

    this.renderer.setStyle(this.selectedElement, input.name, input.value);
  }

  sendBackward() {
    /**
     * If zIndex is lower or equal than 0, return
     * so it doesn't put the element behind the canvas
     * */
    if (this.elementAtt.zIndex <= 0) {
      return;
    }
    this.elementAtt.zIndex--;
    this.renderer.setStyle(
      this.selectedElement,
      'z-index',
      this.elementAtt.zIndex
    );
  }

  sendForward() {
    this.elementAtt.zIndex = this.elementAtt.zIndex + 1;
    this.renderer.setStyle(
      this.selectedElement,
      'z-index',
      this.elementAtt.zIndex
    );
  }

  changeShadow() {
    const alpha = Math.round((this.elementAtt.shadowAlpha / 100) * 255).toString(16);

    const shadowString = `
      ${this.elementAtt.shadowX}px 
      ${this.elementAtt.shadowY}px 
      ${this.elementAtt.shadowBlur}px 
      ${this.elementAtt.shadowSpread}px 
      ${this.elementAtt.shadowColor}${alpha}
    `;
    this.renderer.setStyle(
      this.selectedElement,
      'box-shadow',
      shadowString
    );
  }

  changeBlur() {
    this.renderer.setStyle(
      this.selectedElement,
      'filter',
      `blur(${this.elementAtt.blur}px)`
    );
  }

  toggleFill() {
    const settedColor = this.elementAtt.hasFill ? '#FFFFFF' : 'transparent';
    this.renderer.setStyle(
      this.selectedElement,
      'background-color',
      settedColor
    );

    // Set default background color
    this.elementAtt.bgColor = '#FFFFFF';
  }

  toggleBorder() {
    const settedBorder = this.elementAtt.hasBorder ? 'solid 2px black' : 'none';
    this.renderer.setStyle(
      this.selectedElement,
      'border',
      settedBorder
    );

    // Set default border styles
    this.elementAtt.borderStyle = this.elementAtt.hasBorder ? 'solid' : 'none';
    this.elementAtt.borderWidth = this.elementAtt.hasBorder ? 2 : 0;
    this.elementAtt.borderColor = 'black';
  }


  toggleBoxShadow() {
    this.renderer.setStyle(this.selectedElement, 'box-shadow', 'none');

    this.elementAtt.shadowX = 0;
    this.elementAtt.shadowY = 0;
    this.elementAtt.shadowBlur = 0;
    this.elementAtt.shadowSpread = 0;
    this.elementAtt.shadowColor = '#F0F0F0';
    this.elementAtt.shadowAlpha = 100;
  }

  toggleBlur() {
    this.renderer.removeStyle(this.selectedElement, 'filter');
    this.elementAtt.blur = 0;
  }
}
