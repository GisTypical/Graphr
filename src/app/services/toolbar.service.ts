import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToolbarService {
  private notifyGenFiles$ = new Subject<boolean>();
  // private notifyGenFiles$ = new BehaviorSubject<boolean>(false);

  constructor() { }

  setGenFiles(notification: boolean) {
    this.notifyGenFiles$.next(notification);
  }

  getGenFiles(): Observable<boolean> {
    return this.notifyGenFiles$.asObservable();
  }

  // setNotificacionGenFiles(notification: boolean) {
  //   return this.notifyGenFiles$.next(notification);
  // }

  // getNotificationGenFiles(): Observable<boolean> {
  //   return this.notifyGenFiles$.asObservable();
  // }
}
