import { CdkDragDrop, DragDrop } from '@angular/cdk/drag-drop';
import { Component, ElementRef, HostListener, Renderer2 } from '@angular/core';

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
    private canvas: ElementRef
  ) {}

  // Check keyboards events for components deletion
  @HostListener('document:keydown', ['$event'])
  handleKey(event: KeyboardEvent): void {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      for (const element of this.selectedElements) {
        element.remove();
      }
      this.selectedElements = [];
    }
  }

  // Check every click in document for element deselection
  @HostListener('document:click', ['$event'])
  handleClick(event: PointerEvent) {
    for (const element of this.selectedElements) {
      this.renderer.removeClass(element, 'selected');
    }
    this.selectedElements = [];
  }

  // Dropped element event
  @HostListener('cdkDropListDropped', ['$event'])
  drop(event: CdkDragDrop<number[]>) {
    console.log(event);
    /**
     * Get dragging component
     * - nativeElement -> children[index] -> *firstChild* -> **firstChild**
     * - dropList div -> article -> *div drag wrapper* -> **component**
     *
     * Made this way to access the components dimensions
     * without appending the element to the DOM
     */
    const component = event.previousContainer.element.nativeElement.children[
      event.previousIndex
    ].firstChild.firstChild as HTMLElement;

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
      e.stopPropagation();
      this.renderer.addClass(e.target, 'selected');
      if (e.ctrlKey) {
        this.selectedElements.push(e.target as HTMLElement);
      } else {
        for (const element of this.selectedElements) {
          this.renderer.removeClass(element, 'selected');
        }
        this.selectedElements = [e.target as HTMLElement];
      }
    });

    // Create draggable element from clonedComponent
    const dragComponent = this.dragDrop.createDrag(clonedComponent);
    dragComponent.withBoundaryElement(this.canvas);
    // Check if element is dropped outside the canvas, if it is, return
    if (this.isOutOfBounds(event, component)) {
      return;
    }

    this.renderer.appendChild(this.canvas.nativeElement, clonedComponent);
  }

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
