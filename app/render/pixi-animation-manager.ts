import { IAnimation } from "./pixi-animation";
import { AnimationParallel } from "./pixi-animation-combined";

export class AnimationsManager extends AnimationParallel {
  constructor(onCompleted?: () => void) {
    super([], onCompleted);
  }

  AddAnimation(animation: IAnimation): void {
    this.animations.push(animation);
  }

  update(elapsedMs: number): void {
    const hasAnimations = this.animations.length > 0;

    super.update(elapsedMs);

    if (hasAnimations && this.animations.length == 0) {
      if (this.onCompleted) {
        this.onCompleted();
      }
    }
  }
}
