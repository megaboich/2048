interface Observer<T> {
    Update(arg: T):void;
}

class Observable<T> { // or Interface
    private observers: Observer<T>[];

    constructor() {
        this.observers = [];
    }

    RegisterObserver(observer: Observer<T>): void {
        this.observers.push(observer);
    }

    RemoveObserver(observer: Observer<T>): void {
        this.observers.splice(this.observers.indexOf(observer), 1);
    }

    NotifyObservers(arg: T): void {

        this.observers.forEach((observer: Observer<T>) => {
            observer.Update(arg);
        });
    }
}