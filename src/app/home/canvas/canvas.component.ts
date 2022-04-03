import { CdkDragDrop, DragDrop, DragRef, Point } from '@angular/cdk/drag-drop';
import { Component, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { SelectedElementsService } from '../../core/services/selected-elements/selected-elements.service';

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
    private selectedService: SelectedElementsService
  ) {}

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

    // Append element for making width and height accessible
    this.renderer.appendChild(this.canvas.nativeElement, clonedComponent);

    // Create draggable element from clonedComponent
    const dragComponent = this.dragDrop.createDrag(clonedComponent);
    dragComponent.withBoundaryElement(this.canvas);

    // Add selection click event for every new element in canvas
    clonedComponent.addEventListener('click', (e) => this.selectElements(e));
    // Add event when element is move in canvas
    dragComponent.ended.subscribe((dragEnd) => this.movedEnd(dragEnd));

    // Remove added element if it is out of bounds
    if (this.isOutOfBounds(event, clonedComponent)) {
      this.renderer.removeChild(this.canvas.nativeElement, clonedComponent);
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

  private movedEnd(event: {
    source: DragRef<any>;
    distance: Point;
    dropPoint: Point;
  }) {
    // Reset element transform that sets while dragging
    event.source.reset();
    const canvasRect = this.canvas.nativeElement.getBoundingClientRect();

    const elementRect = event.source.getRootElement().getBoundingClientRect();
    // If pointer is out of bounds return (TODO: can be reworked)
    // console.log(
    //   elementRect.x,
    //   canvasRect.x + canvasRect.width - elementRect.width
    // );
    // if (
    //   elementRect.x < canvasRect.x ||
    //   elementRect.x > canvasRect.x + canvasRect.width - elementRect.width
    // ) {
    //   return;
    // }

    const draggedElement = event.source.getRootElement();
    const lastTop = parseInt(draggedElement.style.top, 10);
    draggedElement.style.top = `${lastTop + event.distance.y}px`;

    const lastLeft = parseInt(draggedElement.style.left, 10);
    draggedElement.style.left = `${lastLeft + event.distance.x}px`;
  }

  /**
   * Method that calculates if an **element** is out of bound depending of
   * the dropPoint of the drop event and the element width or height
   *
   * @param event Event from dropping the element
   * @param component Component that's getting dragged
   * @returns If the element is out of bounds
   */
  private isOutOfBounds(event: CdkDragDrop<number[]>, component: HTMLElement) {
    // Get Canvas Dimensions
    const canvasRect = this.canvas.nativeElement.getBoundingClientRect();
    const componentRect = component.getBoundingClientRect();

    const outOfBoundsX =
      event.dropPoint.x < canvasRect.x ||
      event.dropPoint.x > canvasRect.x + canvasRect.width - componentRect.width;

    const outOfBoundsY =
      event.dropPoint.y < canvasRect.y ||
      event.dropPoint.y >
      canvasRect.y + canvasRect.height - componentRect.height;

    return outOfBoundsX || outOfBoundsY;
  }
}
