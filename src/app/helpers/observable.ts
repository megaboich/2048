
class Observable<T> { // or Interface
    private observers: ((eventArgs: T) => void)[] = [];

    constructor() {
    }

    RegisterObserver(observer: (eventArgs: T) => void): void {
        this.observers.push(observer);
    }

    RemoveObserver(observer: (eventArgs: T) => void): void {
        this.observers.splice(this.observers.indexOf(observer), 1);
    }

    NotifyObservers(arg: T): void {
        this.observers.forEach(observer => {
            observer(arg);
        });
    }
}