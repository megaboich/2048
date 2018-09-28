import { AnimationBase, IAnimation } from "./pixi-animation";

export class AnimationScale extends AnimationBase implements IAnimation {
  targetScale: number;

  constructor(
    entity: PIXI.DisplayObject,
    durationInMs: number,
    newScale: number,
    onCompleted?: () => void
  ) {
    super(entity, durationInMs, onCompleted);
    this.targetScale = newScale;
  }

  update(elapsedMs: number): void {
    if (this.durationRemains > elapsedMs) {
      const d =
        elapsedMs *
        (this.targetScale - this.entity.scale.x) /
        this.durationRemains;
      this.entity.scale.x += d;
      this.entity.scale.y += d;
      this.durationRemains -= elapsedMs;
    } else {
      // Here is final call
      this.entity.scale.x = this.targetScale;
      this.entity.scale.y = this.targetScale;
      this.isCompleted = true;
      this.durationRemains = 0;
    }
  }
}
