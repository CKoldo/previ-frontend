import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  setLoading(isLoading: boolean): void {
    console.log('LoadingService: setLoading', isLoading);
    this.loadingSubject.next(isLoading);
  }

  getLoading(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

}
