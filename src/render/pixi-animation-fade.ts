import { AnimationBase, IAnimation } from "./pixi-animation";

export class AnimationFade extends AnimationBase implements IAnimation {
  targetOpacity: number;

  constructor(
    entity: PIXI.DisplayObject,
    durationInMs: number,
    newOpacity: number,
    onCompleted?: () => void
  ) {
    super(entity, durationInMs, onCompleted);
    this.targetOpacity = newOpacity;
  }

  update(elapsedMs: number): void {
    if (this.durationRemains > elapsedMs) {
      const d =
        elapsedMs *
        (this.targetOpacity - this.entity.alpha) /
        this.durationRemains;
      this.entity.alpha += d;
      this.durationRemains -= elapsedMs;
    } else {
      // Here is final call
      this.entity.alpha = this.targetOpacity;
      this.isCompleted = true;
      this.durationRemains = 0;
    }
  }
}
