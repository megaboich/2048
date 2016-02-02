///<reference path="pixi-animation.ts"/>

class PixiAnimationScale extends PixiAnimationBase implements IPixiAnimation {
    TargetScale: number;

    constructor(entity: PIXI.DisplayObject, durationInMs: number, newScale: number, onCompleted: () => void = null) {
        super(entity, durationInMs, onCompleted);
        this.TargetScale = newScale;
    }

    Update(elapsedMs: number): void {
        if (this.durationRemains > elapsedMs) {
            var d = (elapsedMs * (this.TargetScale - this.Entity.scale.x)) / this.durationRemains;
            this.Entity.scale.x += d;
            this.Entity.scale.y += d;
            this.durationRemains -= elapsedMs;
        } else {
            // Here is final call
            this.Entity.scale.x = this.TargetScale;
            this.Entity.scale.y = this.TargetScale;
            this.IsCompleted = true;
            this.durationRemains = 0;
        }
    }
}
