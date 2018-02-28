export interface IAnimation {
  update(elapsedMs: number): void;
  isCompleted: boolean;
  onCompleted?: () => void;
}

export class AnimationBase {
  entity: PIXI.DisplayObject;
  isCompleted: boolean;
  protected durationRemains: number;
  onCompleted?: () => void;

  constructor(
    entity: PIXI.DisplayObject,
    durationInMs: number,
    onCompleted?: () => void
  ) {
    if (!entity) {
      throw new Error("Entity is not defined");
    }
    this.entity = entity;
    this.onCompleted = onCompleted;
    this.durationRemains = durationInMs;
    this.isCompleted = false;
  }
}
