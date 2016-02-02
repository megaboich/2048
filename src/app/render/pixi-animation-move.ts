///<reference path="pixi-animation.ts"/>

interface EntityPosition {
    x: number;
    y: number;
}

class PixiAnimationMove extends PixiAnimationBase implements IPixiAnimation {
    TargetPosition: EntityPosition;

    constructor(entity: PIXI.DisplayObject, durationInMs: number, newPosition: EntityPosition, onCompleted: () => void = null) {
        super(entity, durationInMs, onCompleted);
        this.TargetPosition = newPosition;
    }

    Update(elapsedMs: number): void {
        if (this.durationRemains > elapsedMs) {
            // Calculate dx and dy
            var dx = (elapsedMs * (this.TargetPosition.x - this.Entity.x)) / this.durationRemains;
            var dy = (elapsedMs * (this.TargetPosition.y - this.Entity.y)) / this.durationRemains;
            this.Entity.x += dx;
            this.Entity.y += dy;
            this.durationRemains -= elapsedMs;
        } else {
            // Here is final call
            this.Entity.x = this.TargetPosition.x;
            this.Entity.y = this.TargetPosition.y;
            this.IsCompleted = true;
            this.durationRemains = 0;
        }
    }
}
