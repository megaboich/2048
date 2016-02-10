///<reference path="pixi-animation.ts"/>
module PixiExtensions {
    export class AnimationRotate extends AnimationBase implements IAnimation {
        TargetRotation: number;

        constructor(entity: PIXI.DisplayObject, durationInMs: number, addRotation: number, onCompleted: () => void = null) {
            super(entity, durationInMs, onCompleted);
            this.TargetRotation = entity.rotation + addRotation;
        }

        Update(elapsedMs: number): void {
            if (this.durationRemains > elapsedMs) {
                var d = (elapsedMs * (this.TargetRotation - this.Entity.rotation)) / this.durationRemains;
                this.Entity.rotation += d;
                this.durationRemains -= elapsedMs;
            } else {
                // Here is final call
                this.Entity.rotation = this.TargetRotation;
                this.IsCompleted = true;
                this.durationRemains = 0;
            }
        }
    }
}