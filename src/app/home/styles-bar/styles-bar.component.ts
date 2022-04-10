import { Component, OnInit, Renderer2 } from '@angular/core';
import { SelectedElementsService } from '../../core/services/selected-elements/selected-elements.service';
import rgb2hex from '../../shared/utils/rgb2hex';

@Component({
  selector: 'app-styles-bar',
  templateUrl: './styles-bar.component.html',
  styleUrls: ['./styles-bar.component.scss'],
})
export class StylesBarComponent implements OnInit {
  selectedElement: HTMLElement;
  canvasRect: DOMRect;
  elementAtt = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation: 0,
    borderRadius: 0,
    color: '',
    bgColor: '',
    hasFill: false,
    borderColor: '',
    borderStyle: '',
    hasBorder: false,
    borderWidth: 0,
    opacity: 0,
  };

  constructor(
    private selectedService: SelectedElementsService,
    private renderer: Renderer2
  ) {
    this.selectedService.currentSelected.subscribe((value) => {
      // Get last selected element
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

  ngOnInit(): void {}

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

    // const [a, b] = this.getComputedStyle('transform').match(
    //   /-?(0\.)*\d+/gm
    // ) || [0, 0];
    // this.elementAtt.rotation = Math.round((Math.atan2(+b, +a) * 180) / Math.PI);

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
    this.elementAtt.borderStyle = this.elementAtt.hasBorder ? 'solid': 'none';
    this.elementAtt.borderWidth = this.elementAtt.hasBorder ? 2 : 0;
    this.elementAtt.borderColor = 'black';
  }
}
