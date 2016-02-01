///<reference path="..\..\..\lib\typings\tsd.d.ts"/>

interface EntityPosition {
    x: number;
    y: number;
}

class PixiAnimation {
    Entity: PIXI.DisplayObject;
    TargetPosition: EntityPosition;
    IsCompleted: boolean;
    private durationRemains: number;

    constructor(entity: PIXI.DisplayObject, newPosition: EntityPosition, durationInMs: number) {
        this.Entity = entity;
        this.TargetPosition = newPosition;
        this.durationRemains = durationInMs;
        this.IsCompleted = false;
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

class AnimationsCompletedEvent {

}

class PixiAnimationsManager {
    Animations: PixiAnimation[] = [];
    OnAnimationComplete: Observable<AnimationsCompletedEvent> = new Observable<AnimationsCompletedEvent>();
    private hasAnimations: boolean = false;
    private animCompletedEvent: AnimationsCompletedEvent = new AnimationsCompletedEvent();

    constructor() {
    }

    AddAnimation(animation: PixiAnimation): void {
        this.Animations.push(animation);
        this.hasAnimations = true;
    }

    Update(elapsedMs: number): void {
        if (this.Animations.length == 0) {
            if (this.hasAnimations) {
                this.OnAnimationComplete.NotifyObservers(this.animCompletedEvent);
                this.hasAnimations = false;
            }
            return;
        }

        var processedAnimations = this.Animations.filter((animation: PixiAnimation) => {
            animation.Update(elapsedMs);
            return !animation.IsCompleted;
        });

        this.Animations = processedAnimations;
    }
}
