import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

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
}
