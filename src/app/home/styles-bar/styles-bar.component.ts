import { Component, OnInit, Renderer2 } from '@angular/core';
import { SelectedElementsService } from '../../core/services/selected-elements/selected-elements.service';
import ElementAttributes from '../../shared/interfaces/element-attributes';
import separateAlpha from '../../shared/utils/get-rgb-alpha';
import getRgbs from '../../shared/utils/get-rgbs';
import rgb2hex from '../../shared/utils/rgb2hex';

@Component({
  selector: 'app-styles-bar',
  templateUrl: './styles-bar.component.html',
  styleUrls: ['./styles-bar.component.scss'],
})
export class StylesBarComponent implements OnInit {
  // Dragged elements
  selectedElement: HTMLElement;
  canvasRect: DOMRect;
  elementAtt: ElementAttributes = {} as ElementAttributes;

  // Popups
  isShadowMenu = false;
  isBlurMenu = false;

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


    const linearGradient = this.getComputedStyle('backgroundImage');

    const hasGradient = linearGradient !== 'none';
    const hexArray = hasGradient ? getRgbs(linearGradient) : [];

    // Element has fill is its background color isn't 'rgba(0, 0, 0, 0) or element has gradient
    this.elementAtt.hasFill =
      this.getComputedStyle('backgroundColor') !== 'rgba(0, 0, 0, 0)' || (hasGradient && (hexArray[0] !== 'rgba(0, 0, 0, 0)'));

    this.elementAtt.bgColor = !hasGradient ? rgb2hex(this.getComputedStyle('backgroundColor')) : rgb2hex(hexArray[0]);

    this.elementAtt.hasGradient = hasGradient;
    this.elementAtt.gradientDirection = hasGradient ? linearGradient.match(/-?\d+deg/gm)[0] : '0deg';
    this.elementAtt.gradient = hasGradient ? rgb2hex(hexArray[1]) : '#000000';

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
      const [rgb, alpha] = separateAlpha(rgba);
      this.elementAtt.shadowColor = rgb2hex(rgb);

      this.elementAtt.shadowAlpha = Math.round(+alpha * 100);
    } else {
      this.elementAtt.shadowX = 0;
      this.elementAtt.shadowY = 0;
      this.elementAtt.shadowBlur = 0;
      this.elementAtt.shadowSpread = 0;
      this.elementAtt.shadowColor = 'black';
      this.elementAtt.shadowAlpha = 100;
    }

    const blur = this.getComputedStyle('filter');

    this.elementAtt.hasBlur = blur !== 'none';
    this.elementAtt.blur = this.elementAtt.hasBlur ? parseInt(blur.match(/\d+/gm)[0], 10) : 0;

    this.elementAtt.hasHover = this.selectedElement.classList.contains('hover');
    this.elementAtt.hasActive = this.selectedElement.classList.contains('active');
    this.elementAtt.hasFocus = this.selectedElement.classList.contains('focus');
    this.elementAtt.hasFadeIn = this.selectedElement.hasAttribute('fadeIn');
    this.elementAtt.hasSlideDown = this.selectedElement.hasAttribute('slideDown');
    this.elementAtt.hasSlideToRight = this.selectedElement.hasAttribute('slideToRight');
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
    const backgroundBased = ['background-color', 'background', 'gradient-direction'];

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
    if (backgroundBased.indexOf(attribute) !== -1 && this.elementAtt.hasGradient) {
      this.renderer.setStyle(
        this.selectedElement,
        'background',
        `
          linear-gradient(${this.elementAtt.gradientDirection}, 
          ${this.elementAtt.hasFill ? this.elementAtt.bgColor : 'transparent'}, 
          ${this.elementAtt.gradient})
        `
      );
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

  changeGradient() {
    this.renderer.setStyle(
      this.selectedElement,
      'background',
      `
        linear-gradient(${this.elementAtt.gradientDirection}, 
        ${this.elementAtt.hasFill ? this.elementAtt.bgColor : 'transparent'}, 
        ${this.elementAtt.gradient})
      `
    );
  }

  /**
   * TOGGLES
   */

  toggleFill() {
    const settedColor = this.elementAtt.hasFill ? this.elementAtt.bgColor : 'transparent';
    this.renderer.setStyle(
      this.selectedElement,
      'background-color',
      settedColor
    );

    if (this.elementAtt.hasGradient) {
      this.renderer.setStyle(
        this.selectedElement,
        'background',
        `linear-gradient(${this.elementAtt.gradientDirection}, ${settedColor}, ${this.elementAtt.gradient})`
      );
    }

  }

  toggleBorder() {
    const settedBorder = this.elementAtt.hasBorder ? `
      ${this.elementAtt.borderStyle} 
      ${this.elementAtt.borderWidth}px 
      ${this.elementAtt.borderColor}
    ` : 'none';

    this.renderer.setStyle(
      this.selectedElement,
      'border',
      settedBorder
    );
  }


  toggleBoxShadow() {
    const alpha = Math.round((this.elementAtt.shadowAlpha / 100) * 255).toString(16);
    const settedShadow = this.elementAtt.hasBoxShadow ? `
      ${this.elementAtt.shadowX}px 
      ${this.elementAtt.shadowY}px 
      ${this.elementAtt.shadowBlur}px 
      ${this.elementAtt.shadowSpread}px 
      ${this.elementAtt.shadowColor}${alpha}
    ` : 'none';

    this.renderer.setStyle(this.selectedElement, 'box-shadow', settedShadow);
  }

  toggleBlur() {
    this.renderer.removeStyle(this.selectedElement, 'filter');
    this.elementAtt.blur = 0;
  }

  toggleGradient() {
    if (!this.elementAtt.hasGradient) {
      this.renderer.removeStyle(this.selectedElement, 'background');
      this.renderer.setStyle(this.selectedElement, 'background-color', this.elementAtt.hasFill ? this.elementAtt.bgColor : 'transparent');
    } else {
      this.renderer.setStyle(
        this.selectedElement,
        'background',
        `
          linear-gradient(${this.elementAtt.gradientDirection}, 
          ${this.elementAtt.hasFill ? this.elementAtt.bgColor : 'transparent'}, 
          ${this.elementAtt.gradient})
        `
      );
    }
  }

  toggleShadowMenu() {
    this.isShadowMenu = !this.isShadowMenu;
  }

  toggleBlurMenu() {
    this.isBlurMenu = !this.isBlurMenu;
  }

  toggleHover() {
    if (!this.selectedElement.classList.contains('hover')) {
      this.renderer.addClass(this.selectedElement, 'hover');
    } else {
      this.renderer.removeClass(this.selectedElement, 'hover');
    }
  }

  toggleActive() {
    if (!this.selectedElement.classList.contains('active')) {
      this.renderer.addClass(this.selectedElement, 'active');
    } else {
      this.renderer.removeClass(this.selectedElement, 'active');
    }
  }

  toggleFocus() {
    if (!this.selectedElement.classList.contains('focus')) {
      this.renderer.addClass(this.selectedElement, 'focus');
    } else {
      this.renderer.removeClass(this.selectedElement, 'focus');
    }
  }

  toggleFadeIn() {
    if (!this.selectedElement.hasAttribute('fadeIn')) {
      this.renderer.setAttribute(this.selectedElement, 'fadeIn', '');
    } else {
      this.renderer.removeAttribute(this.selectedElement, 'fadeIn');
    }
  }

  toggleSlideDown() {
    if (!this.selectedElement.hasAttribute('slideDown')) {
      this.renderer.setAttribute(this.selectedElement, 'slideDown', '');
    } else {
      this.renderer.removeAttribute(this.selectedElement, 'slideDown');
    }
  }

  toggleSlideToRight() {
    if (!this.selectedElement.hasAttribute('slideToRight')) {
      this.renderer.setAttribute(this.selectedElement, 'slideToRight', '');
    } else {
      this.renderer.removeAttribute(this.selectedElement, 'slideToRight');
    }
  }
}
