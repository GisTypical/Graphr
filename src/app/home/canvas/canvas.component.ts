import { CdkDragDrop, DragDrop } from '@angular/cdk/drag-drop';
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

  @HostListener('document:keydown', ['$event'])
  // Check for Backspace or Delete for components deletion
  handleKey(event: KeyboardEvent): void {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      for (const element of this.selectedElements) {
        element.remove();
      }
      this.clearSelectedElements();
    }
  }

  @HostListener('document:click', ['$event'])
  // Check if there was a click on the document for deselect elements
  handleClick() {
    for (const element of this.selectedElements) {
      this.renderer.removeClass(element, 'selected');
    }
    this.clearSelectedElements();
  }

  // Dropped element event
  @HostListener('cdkDropListDropped', ['$event'])
  drop(event: CdkDragDrop<number[]>) {
    console.log(event);
    /**
     * Get dragging component
     * - nativeElement -> children[index] -> firstChild -> firstChild -> **firstChild**
     * - dropList div -> article -> *div drag wrapper* -> li -> **component**
     *
     * Made this way to access the components dimensions
     * without appending the element to the DOM
     */
    const component = event.previousContainer.element.nativeElement.children[
      event.previousIndex
    ].firstChild.firstChild.firstChild as HTMLElement;

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

    // Add selection click event for every new element in canvas
    clonedComponent.addEventListener('click', (e) => {
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
    });

    // Create draggable element from clonedComponent
    const dragComponent = this.dragDrop.createDrag(clonedComponent);
    dragComponent.withBoundaryElement(this.canvas);

    if (this.isOutOfBounds(event, component)) {
      return;
    }

    this.renderer.appendChild(this.canvas.nativeElement, clonedComponent);
  }

  clearSelectedElements() {
    this.selectedElements = [];
    this.selectedService.setSelected([]);
  }

  /**
   * Method that calculates if an element is out of bound depending of
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
