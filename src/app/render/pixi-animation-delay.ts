///<reference path="pixi-animation.ts"/>

class PixiAnimationDelay implements IPixiAnimation {
    IsCompleted: boolean;
    OnCompleted: () => void;
    protected durationRemains: number;

    constructor(durationInMs: number, onCompleted: () => void = null) {
        this.durationRemains = durationInMs;
        this.IsCompleted = false;
        this.OnCompleted = onCompleted;
    }

    Update(elapsedMs: number): void {
        if (this.durationRemains > elapsedMs) {
            this.durationRemains -= elapsedMs;
        } else {
            // Here is final call
            this.IsCompleted = true;
            this.durationRemains = 0;
        }
    }
}
