/* eslint-disable @typescript-eslint/prefer-for-of */
import { CdkDragDrop, DragDrop, DragRef, Point } from '@angular/cdk/drag-drop';
import {
  Component,
  ElementRef,
  HostListener,
  Renderer2,
  AfterViewInit,
} from '@angular/core';
import { SelectedElementsService } from '../../core/services/selected-elements/selected-elements.service';
import { ElectronService } from '../../core/services';
import panzoom, { Transform } from 'panzoom';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss', '../home.component.scss'],
})
export class CanvasComponent implements AfterViewInit {
  selectedElements: HTMLElement[] = [];

  private canvasScale: number;

  constructor(
    private dragDrop: DragDrop,
    private renderer: Renderer2,
    private canvas: ElementRef,
    private selectedService: SelectedElementsService,
    private electronService: ElectronService
  ) { }

  @HostListener('keydown', ['$event'])
  // Check for Backspace or Delete for components deletion
  handleKey(event: KeyboardEvent): void {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      for (const element of this.selectedElements) {
        element.remove();
      }
      this.clearSelectedElements();
    }
  }

  @HostListener('click', ['$event'])
  // Check if there was a click on canvas for deselect elements
  handleClick() {
    for (const element of this.selectedElements) {
      this.renderer.removeClass(element, 'selected');
    }
    this.clearSelectedElements();
  }

  @HostListener('cdkDropListDropped', ['$event'])
  // - Dropped element event -
  drop(event: CdkDragDrop<number[]>) {
    // Get dragging component from index
    const component = event.item.getRootElement().firstChild.firstChild;
    const clonedComponent = component.cloneNode(true) as HTMLElement;

    const { x: canvasX, y: canvasY } = this.currentCanvasRect();

    // Calculate element's dropped position relying on the canvas `transform`
    const x = (event.dropPoint.x - Math.round(canvasX)) / this.canvasScale;
    const y = (event.dropPoint.y - Math.round(canvasY)) / this.canvasScale;

    // Set styles to component
    this.renderer.setStyle(clonedComponent, 'position', 'absolute');
    this.renderer.setStyle(clonedComponent, 'left', `${x}px`);
    this.renderer.setStyle(clonedComponent, 'top', `${y}px`);

    this.renderer.setAttribute(clonedComponent, 'contenteditable', 'true');
    this.renderer.setAttribute(clonedComponent, 'spellcheck', 'false');

    if (clonedComponent.tagName === 'SPAN') {
      clonedComponent.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
        }
      });
    }

    this.selectedService.generateUUID(clonedComponent);

    // Append element for making width and height accessible
    this.renderer.appendChild(this.canvas.nativeElement, clonedComponent);

    // Create draggable element from clonedComponent
    const dragComponent = this.dragDrop.createDrag(clonedComponent);

    // Add selection click event for every new element in canvas
    clonedComponent.addEventListener('click', (e) => this.selectElements(e));

    // Add event when element is move in canvas
    dragComponent.ended.subscribe((dragEnd) => this.moved(dragEnd));

    // constrainPosition determines how the element moves while dragging
    dragComponent.constrainPosition = (point, dragRef) =>
      this.constrainPosition(dragRef, point);

    // Remove added element if it is out of bounds
    if (this.isOutOfBounds(event.dropPoint, clonedComponent)) {
      this.renderer.removeChild(this.canvas.nativeElement, clonedComponent);
    }

    if (clonedComponent.tagName === 'IMG') {
      this.electronService.invoke('image').then(img => {
        (clonedComponent as HTMLImageElement).src = img || '../../../assets/images/image.png';
        console.log(img);
      });
    }
  }

  ngAfterViewInit(): void {
    // When component starts convert canvas in a panzoom element
    const panzoomCanvas = panzoom(this.canvas.nativeElement, {
      beforeMouseDown: (e) => !e.ctrlKey,
      maxZoom: 1.1,
      minZoom: 0.1,
    });

    // Update canvas scale with every canvas transform
    panzoomCanvas.on('transform', (e) => {
      this.canvasScale = panzoomCanvas.getTransform().scale;
    });
  }

  private selectElements(e: MouseEvent) {
    // Prevent event bubbling
    e.stopPropagation();
    this.renderer.addClass(e.target, 'selected');

    // If multiple selection active, append elements to selected array
    if (e.ctrlKey) {
      this.selectedElements.push(e.target as HTMLElement);
    } else {
      // If single element selection, remove other elements, except current el
      for (const element of this.selectedElements) {
        if (element === e.target) {
          break;
        }
        this.renderer.removeClass(element, 'selected');
      }
      this.selectedElements = [e.target as HTMLElement];
    }

    this.selectedService.setSelected(this.selectedElements);
  }

  private clearSelectedElements() {
    this.selectedElements = [];
    this.selectedService.setSelected([]);
  }

  private moved(event: {
    source: DragRef<any>;
    distance: Point;
    dropPoint: Point;
  }) {
    // Reset element transform that sets while dragging
    event.source.reset();

    const draggedElement = event.source.getRootElement();

    const { x: canvasX, y: canvasY } = this.currentCanvasRect();

    // Calculate element position based of canvas location, and scale
    let elementX = (event.dropPoint.x - Math.round(canvasX)) / this.canvasScale;
    let elementY = (event.dropPoint.y - Math.round(canvasY)) / this.canvasScale;

    this.renderer.setStyle(draggedElement, 'left', `${elementX}px`);
    this.renderer.setStyle(draggedElement, 'top', `${elementY}px`);
  }

  /**
   * Method that calculates if an **element** is out of bound depending of
   * the dropPoint of the drop event and the element width or height
   *
   * @param event Event from dropping the element
   * @param component Component that's getting dragged
   * @returns If the element is out of bounds
   */
  private isOutOfBounds(
    dropPoint: { x: number; y: number },
    component: HTMLElement
  ) {
    // Get Canvas Dimensions
    const {
      x: canvasX,
      y: canvasY,
      width: canvasWidth,
      height: canvasHeight,
    } = this.currentCanvasRect();

    const componentRect = component.getBoundingClientRect();

    const outOfBoundsX =
      dropPoint.x < canvasX ||
      dropPoint.x > canvasX + canvasWidth - componentRect.width;

    const outOfBoundsY =
      dropPoint.y < canvasY ||
      dropPoint.y > canvasY + canvasHeight - componentRect.height;

    return outOfBoundsX || outOfBoundsY;
  }

  private constrainPosition(dragRef: DragRef<any>, point: Point) {
    let zoomMoveXDifference = 0;
    let zoomMoveYDifference = 0;

    // Set element movement constrain based on the canvas scale and the element free position
    if (this.canvasScale !== 1) {
      zoomMoveXDifference =
        (1 - this.canvasScale) * dragRef.getFreeDragPosition().x;
      zoomMoveYDifference =
        (1 - this.canvasScale) * dragRef.getFreeDragPosition().y;
    }

    return {
      x: point.x + zoomMoveXDifference,
      y: point.y + zoomMoveYDifference,
    };
  }

  private currentCanvasRect(): DOMRect {
    return this.canvas.nativeElement.getBoundingClientRect();
  }
}
