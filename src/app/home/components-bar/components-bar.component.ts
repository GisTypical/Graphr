/* eslint-disable max-len */
import { CdkDrag, CdkDragMove } from '@angular/cdk/drag-drop';
import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { CanvasScaleService } from '../../core/services/canvas-scale/canvas-scale.service';

@Component({
  selector: 'app-components-bar',
  templateUrl: './components-bar.component.html',
  styleUrls: ['./components-bar.component.scss', '../home.component.scss'],
})
export class ComponentsBarComponent implements OnInit {
  @ViewChild('layout_dropdown') layoutDropdown: ElementRef;
  @ViewChild('text_dropdown') textDropdown: ElementRef;
  @ViewChild('forms_dropdown') formsDropdown: ElementRef;

  isOpenLayout = false;
  isOpenText = false;
  isOpenForms = false;

  canvasScale = 1;

  constructor(
    private canvasScaleService: CanvasScaleService,
    private renderer: Renderer2
  ) {
    this.canvasScaleService.currentCanvasScale.subscribe((scale) => {
      this.canvasScale = scale;
    });
  }

  ngOnInit(): void {}

  toggleDetails(): boolean {
    this.isOpenLayout = this.layoutDropdown.nativeElement.hasAttribute('open');
    this.isOpenText = this.textDropdown.nativeElement.hasAttribute('open');
    this.isOpenForms = this.formsDropdown.nativeElement.hasAttribute('open');

    return this.isOpenLayout || this.isOpenText || this.isOpenForms;
  }

  scalePreview(event: CdkDragMove) {
    const previewElement = event.source.element.nativeElement
      .nextElementSibling as HTMLElement;

    this.renderer.setStyle(previewElement, 'transform-origin', 'top left');

    this.renderer.setStyle(
      previewElement,
      'transform',
      `translate(${event.pointerPosition.x}px, ${event.pointerPosition.y}px)` +
        ` scale(${this.canvasScale})`
    );
  }
}
