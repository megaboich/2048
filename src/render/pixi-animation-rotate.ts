import { AnimationBase, IAnimation } from "./pixi-animation";

export class AnimationRotate extends AnimationBase implements IAnimation {
  targetRotation: number;

  constructor(
    entity: PIXI.DisplayObject,
    durationInMs: number,
    addRotation: number,
    onCompleted?: () => void
  ) {
    super(entity, durationInMs, onCompleted);
    this.targetRotation = entity.rotation + addRotation;
  }

  update(elapsedMs: number): void {
    if (this.durationRemains > elapsedMs) {
      const d =
        elapsedMs *
        (this.targetRotation - this.entity.rotation) /
        this.durationRemains;
      this.entity.rotation += d;
      this.durationRemains -= elapsedMs;
    } else {
      // Here is final call
      this.entity.rotation = this.targetRotation;
      this.isCompleted = true;
      this.durationRemains = 0;
    }
  }
}
