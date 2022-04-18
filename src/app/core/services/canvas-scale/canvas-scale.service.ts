import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CanvasScaleService {
  currentCanvasScale: Observable<number>;
  private scaleSubject = new Subject<number>();

  constructor() {
    this.currentCanvasScale = this.scaleSubject.asObservable();
  }

  setCanvasScale(scale: number) {
    this.scaleSubject.next(scale);
  }
}
