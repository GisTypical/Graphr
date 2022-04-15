/* eslint-disable @typescript-eslint/prefer-for-of */
import { CdkDragDrop, DragDrop, DragRef, Point } from '@angular/cdk/drag-drop';
import { Component, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { SelectedElementsService } from '../../core/services/selected-elements/selected-elements.service';
import * as uuid from 'uuid';
import { ElectronService } from '../../core/services';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss', '../home.component.scss'],
})
export class CanvasComponent {
  selectedElements: HTMLElement[] = [];

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

    // Set styles to component
    this.renderer.setStyle(clonedComponent, 'position', 'absolute');
    this.renderer.setStyle(
      clonedComponent,
      'left',
      `${event.dropPoint.x.toString()}px`
    );
    this.renderer.setStyle(
      clonedComponent,
      'top',
      `${event.dropPoint.y.toString()}px`
    );

    this.renderer.setAttribute(clonedComponent, 'contenteditable', 'true');
    this.renderer.setAttribute(clonedComponent, 'spellcheck', 'false');

    if (clonedComponent.tagName === 'SPAN') {
      clonedComponent.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
        }
      });
    }

    this.generateUUID(clonedComponent);

    // Append element for making width and height accessible
    this.renderer.appendChild(this.canvas.nativeElement, clonedComponent);

    // Create draggable element from clonedComponent
    const dragComponent = this.dragDrop.createDrag(clonedComponent);
    dragComponent.withBoundaryElement(this.canvas);

    // Add selection click event for every new element in canvas
    clonedComponent.addEventListener('click', (e) => this.selectElements(e));
    // Add event when element is move in canvas
    dragComponent.ended.subscribe((dragEnd) => this.moved(dragEnd));

    // Remove added element if it is out of bounds
    if (this.isOutOfBounds(event.dropPoint, clonedComponent)) {
      this.renderer.removeChild(this.canvas.nativeElement, clonedComponent);
    }

    if(clonedComponent.tagName === 'IMG') {
      this.electronService.invoke('image').then(img => {
        (clonedComponent as HTMLImageElement).src = img || '../../../assets/images/image.png';
        console.log(img);
      });
    }
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
    const elementRect = draggedElement.getBoundingClientRect();

    const elPosition = {
      x: elementRect.x + event.distance.x,
      y: elementRect.y + event.distance.y,
    };
    // If pointer is out of bounds return (TODO: can be reworked)
    if (this.isOutOfBounds(elPosition, draggedElement)) {
      return;
    }

    this.renderer.setStyle(draggedElement, 'left', `${elPosition.x}px`);
    this.renderer.setStyle(draggedElement, 'top', `${elPosition.y}px`);
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
    const canvasRect = this.canvas.nativeElement.getBoundingClientRect();
    const componentRect = component.getBoundingClientRect();

    const outOfBoundsX =
      dropPoint.x < canvasRect.x ||
      dropPoint.x > canvasRect.x + canvasRect.width - componentRect.width;

    const outOfBoundsY =
      dropPoint.y < canvasRect.y ||
      dropPoint.y > canvasRect.y + canvasRect.height - componentRect.height;

    return outOfBoundsX || outOfBoundsY;
  }

  private generateUUID(component: HTMLElement) {
    const myUUID = uuid.v4();
    component.id = `_${myUUID}`;

    if (component.children.length > 0) {
      for (let index = 0; index < component.children.length; index++) {
        this.generateUUID(component.children[index] as HTMLElement);
      }
    }
  }
}
