import { IAnimation } from './pixi-animation'
import { AnimationParallel } from './pixi-animation-combined'

export class AnimationsManager extends AnimationParallel {
    constructor(onCompleted: () => void = null) {
        super([], onCompleted);
    }

    AddAnimation(animation: IAnimation): void {
        this.Animations.push(animation);
    }

    Update(elapsedMs: number): void {
        var hasAnimations = (this.Animations.length > 0);

        super.Update(elapsedMs);

        if (hasAnimations && (this.Animations.length == 0)) {
            if (this.OnCompleted != null) {
                this.OnCompleted();
            }
        }
    }
}
