import { AnimationBase, IAnimation } from "./pixi-animation";

export interface EntityPosition {
  x: number;
  y: number;
}

export class AnimationMove extends AnimationBase implements IAnimation {
  targetPosition: EntityPosition;

  constructor(
    entity: PIXI.DisplayObject,
    durationInMs: number,
    newPosition: EntityPosition,
    onCompleted?: () => void
  ) {
    super(entity, durationInMs, onCompleted);
    this.targetPosition = newPosition;
  }

  update(elapsedMs: number): void {
    if (this.durationRemains > elapsedMs) {
      // Calculate dx and dy
      const dx =
        elapsedMs *
        (this.targetPosition.x - this.entity.x) /
        this.durationRemains;
      const dy =
        elapsedMs *
        (this.targetPosition.y - this.entity.y) /
        this.durationRemains;
      this.entity.x += dx;
      this.entity.y += dy;
      this.durationRemains -= elapsedMs;
    } else {
      // Here is final call
      this.entity.x = this.targetPosition.x;
      this.entity.y = this.targetPosition.y;
      this.isCompleted = true;
      this.durationRemains = 0;
    }
  }
}
