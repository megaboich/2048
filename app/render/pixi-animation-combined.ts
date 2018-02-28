import { IAnimation } from "./pixi-animation";

export class AnimationParallel implements IAnimation {
  animations: IAnimation[] = [];
  onCompleted?: () => void;
  isCompleted: boolean;

  constructor(animations: IAnimation[], onCompleted?: () => void) {
    this.animations = animations;
    this.onCompleted = onCompleted;
    this.isCompleted = false;
  }

  update(elapsedMs: number): void {
    if (this.animations.length == 0) {
      return;
    }

    const completedEvents = <(() => void)[]>[];
    const processedAnimations = this.animations.filter(
      (animation: IAnimation) => {
        animation.update(elapsedMs);
        if (animation.isCompleted && animation.onCompleted) {
          completedEvents.push(animation.onCompleted);
        }
        return !animation.isCompleted;
      }
    );

    this.animations = processedAnimations;

    // call completed events
    completedEvents.forEach(e => e());

    if (this.animations.length == 0) {
      this.isCompleted = true;
    }
  }
}

export class AnimationQueue implements IAnimation {
  animations: IAnimation[] = [];
  onCompleted?: () => void;
  isCompleted: boolean;

  constructor(animations: IAnimation[], onCompleted?: () => void) {
    this.animations = animations;
    this.onCompleted = onCompleted;
    this.isCompleted = false;
  }

  update(elapsedMs: number): void {
    if (this.animations.length == 0) {
      return;
    }

    const animation = this.animations[0];
    animation.update(elapsedMs);
    if (animation.isCompleted) {
      if (animation.onCompleted) {
        animation.onCompleted();
      }
      this.animations.splice(0, 1);
    }

    if (this.animations.length == 0) {
      this.isCompleted = true;
    }
  }
}
