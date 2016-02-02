///<reference path="pixi-animation.ts"/>

class PixiAnimationParallel implements IPixiAnimation {
    Animations: IPixiAnimation[] = [];
    OnCompleted: () => void;
    IsCompleted: boolean;
    private onCompletedInternal: () => void;

    constructor(animations: IPixiAnimation[], onCompleted: () => void = null) {
        this.Animations = animations;
        this.OnCompleted = onCompleted;
        this.IsCompleted = false;
    }

    Update(elapsedMs: number): void {
        if (this.Animations.length == 0) {
            return;
        }

        var completedEvents = <Array<() => void>>[];
        var processedAnimations = this.Animations.filter((animation: IPixiAnimation) => {
            animation.Update(elapsedMs);
            if (animation.IsCompleted && animation.OnCompleted != null) {
                completedEvents.push(animation.OnCompleted);
            }
            return !animation.IsCompleted;
        });

        this.Animations = processedAnimations;
        
        // call completed events
        completedEvents.forEach(e => e());

        if (this.Animations.length == 0) {
            if (this.OnCompleted != null) {
                this.OnCompleted();
            }
            this.IsCompleted = true;
        }
    }
}

class PixiAnimationQueue implements IPixiAnimation {
    Animations: IPixiAnimation[] = [];
    OnCompleted: () => void;
    IsCompleted: boolean;
    private onCompletedInternal: () => void;

    constructor(animations: IPixiAnimation[], onCompleted: () => void = null) {
        this.Animations = animations;
        this.OnCompleted = onCompleted;
        this.IsCompleted = false;
    }

    Update(elapsedMs: number): void {
        if (this.Animations.length == 0) {
            return;
        }

        var animation = this.Animations[0];
        animation.Update(elapsedMs);
        if (animation.IsCompleted) {
            if (animation.OnCompleted != null) {
                animation.OnCompleted();
            }
            this.Animations.splice(0, 1);
        }

        if (this.Animations.length == 0) {
            if (this.OnCompleted != null) {
                this.OnCompleted();
            }
            this.IsCompleted = true;
        }
    }
}
