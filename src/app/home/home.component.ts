import { CdkDragDrop, DragDrop } from '@angular/cdk/drag-drop';
import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  @ViewChild('canvas') canvas: ElementRef<HTMLElement>;

  list = Array(15)
    .fill('')
    .map((_, i) => i + 1);
  selectedElements: HTMLElement[] = [];

  constructor(private dragDrop: DragDrop, private renderer: Renderer2) {}

  @HostListener('document:keydown', ['$event'])
  handleKey(event: KeyboardEvent): void {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      for (const element of this.selectedElements) {
        element.remove();
      }
      this.selectedElements = [];
    }
  }

  @HostListener('document:click', ['$event'])
  handleClick(event: PointerEvent) {
    console.log(event);
    for (const element of this.selectedElements) {
      this.renderer.removeClass(element, 'selected');
    }
    this.selectedElements = [];
  }

  ngOnInit(): void {}

  drop(event: CdkDragDrop<number[]>) {
    console.log(event);
    // Get drop list element
    const currContainer = event.container.element.nativeElement;

    /**
     * Get dragging component
     * - nativeElement -> children[index] -> *firstChild* -> **firstChild**
     * - dropList div -> article -> *div drag wrapper* -> **component**
     *
     * Made this way to access the components dimensions
     * without appending the element to the DOM
     */
    const component =
      event.previousContainer.element.nativeElement.children[
        event.previousIndex
      ].firstChild.firstChild;

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

    clonedComponent.addEventListener('click', (e) => {
      console.log(e);
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

    // Create draggable clonedComponent
    const dragComponent = this.dragDrop.createDrag(clonedComponent);
    dragComponent.withBoundaryElement(this.canvas);
    // Check if element is dropped outside the canvas, if it is, return
    if (this.isOutOfBounds(event, component)) {
      return;
    }

    this.renderer.appendChild(currContainer, clonedComponent);
  }

  private isOutOfBounds(event: CdkDragDrop<number[]>, component: Node) {
    // Get Canvas Dimensions
    const canvasRect = this.canvas.nativeElement.getBoundingClientRect();
    const tempComp = component as HTMLElement;
    const componentRect = tempComp.getBoundingClientRect();

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
