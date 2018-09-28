import { IAnimation } from "./pixi-animation";

export class AnimationDelay implements IAnimation {
  isCompleted: boolean;
  onCompleted?: () => void;
  protected durationRemains: number;

  constructor(durationInMs: number, onCompleted?: () => void) {
    this.durationRemains = durationInMs;
    this.isCompleted = false;
    this.onCompleted = onCompleted;
  }

  update(elapsedMs: number): void {
    if (this.durationRemains > elapsedMs) {
      this.durationRemains -= elapsedMs;
    } else {
      // Here is final call
      this.isCompleted = true;
      this.durationRemains = 0;
    }
  }
}
