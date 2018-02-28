import { IAnimation } from "./pixi-animation";

export class AnimationParallel implements IAnimation {
  Animations: IAnimation[] = [];
  OnCompleted?: () => void;
  IsCompleted: boolean;

  constructor(animations: IAnimation[], onCompleted?: () => void) {
    this.Animations = animations;
    this.OnCompleted = onCompleted;
    this.IsCompleted = false;
  }

  Update(elapsedMs: number): void {
    if (this.Animations.length == 0) {
      return;
    }

    var completedEvents = <Array<() => void>>[];
    var processedAnimations = this.Animations.filter(
      (animation: IAnimation) => {
        animation.Update(elapsedMs);
        if (animation.IsCompleted && animation.OnCompleted) {
          completedEvents.push(animation.OnCompleted);
        }
        return !animation.IsCompleted;
      }
    );

    this.Animations = processedAnimations;

    // call completed events
    completedEvents.forEach(e => e());

    if (this.Animations.length == 0) {
      this.IsCompleted = true;
    }
  }
}

export class AnimationQueue implements IAnimation {
  Animations: IAnimation[] = [];
  OnCompleted?: () => void;
  IsCompleted: boolean;

  constructor(animations: IAnimation[], onCompleted?: () => void) {
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
      if (animation.OnCompleted) {
        animation.OnCompleted();
      }
      this.Animations.splice(0, 1);
    }

    if (this.Animations.length == 0) {
      this.IsCompleted = true;
    }
  }
}
