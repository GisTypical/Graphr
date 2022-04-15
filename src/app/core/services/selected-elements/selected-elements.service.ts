/* eslint-disable @typescript-eslint/prefer-for-of */
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import * as uuid from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class SelectedElementsService {
  currentSelected: Observable<HTMLElement[]>;
  private selectedSubject = new Subject<HTMLElement[]>();

  constructor() {
    this.currentSelected = this.selectedSubject.asObservable();
  }

  setSelected(selected: HTMLElement[]) {
    this.selectedSubject.next(selected);
  }

  generateUUID(component: HTMLElement) {
    const myUUID = uuid.v4();
    component.id = `_${myUUID}`;

    if (component.children.length > 0) {
      for (let index = 0; index < component.children.length; index++) {
        this.generateUUID(component.children[index] as HTMLElement);
      }
    }
  }
}
