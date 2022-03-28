import { Component, OnInit, Renderer2 } from '@angular/core';
import { SelectedElementsService } from '../../core/services/selected-elements/selected-elements.service';

@Component({
  selector: 'app-styles-bar',
  templateUrl: './styles-bar.component.html',
  styleUrls: ['./styles-bar.component.scss'],
})
export class StylesBarComponent implements OnInit {
  selectedElement: HTMLElement;
  canvasRect: DOMRect;
  elementAtt = {
    top: 0,
    left: 0,
  };

  constructor(
    private selectedService: SelectedElementsService,
    private renderer: Renderer2
  ) {
    this.selectedService.currentSelected.subscribe((value) => {
      this.selectedElement = value[value.length - 1];
      if (!this.isElementSelected()) {
        return;
      }

      this.canvasRect =
        this.selectedElement.parentElement.getBoundingClientRect();

      const elementTop = parseInt(this.selectedElement.style.top, 10);
      this.elementAtt.top = elementTop - this.canvasRect.top;

      const elementLeft = parseInt(this.selectedElement.style.left, 10);
      this.elementAtt.left = elementLeft - this.canvasRect.left;
    });
  }

  ngOnInit(): void {}

  isElementSelected(): boolean {
    return this.selectedElement !== undefined;
  }

  changePos({ target: input }: any) {
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
}
