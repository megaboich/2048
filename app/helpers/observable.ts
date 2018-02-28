export class Observable<T> {
  private observers: ((eventArgs: T) => void)[] = [];

  constructor() {
    /**/
  }

  addObserver(observer: (eventArgs: T) => void): void {
    this.observers.push(observer);
  }

  removeObserver(observer: (eventArgs: T) => void): void {
    this.observers.splice(this.observers.indexOf(observer), 1);
  }

  notify(arg: T): void {
    this.observers.forEach(observer => {
      observer(arg);
    });
  }
}
