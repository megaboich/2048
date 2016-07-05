import { IAnimation, AnimationBase } from './pixi-animation'

export class AnimationFade extends AnimationBase implements IAnimation {
    TargetOpacity: number;

    constructor(entity: PIXI.DisplayObject, durationInMs: number, newOpacity: number, onCompleted: () => void = null) {
        super(entity, durationInMs, onCompleted);
        this.TargetOpacity = newOpacity;
    }

    Update(elapsedMs: number): void {
        if (this.durationRemains > elapsedMs) {
            var d = (elapsedMs * (this.TargetOpacity - this.Entity.alpha)) / this.durationRemains;
            this.Entity.alpha += d;
            this.durationRemains -= elapsedMs;
        } else {
            // Here is final call
            this.Entity.alpha = this.TargetOpacity;
            this.IsCompleted = true;
            this.durationRemains = 0;
        }
    }
}