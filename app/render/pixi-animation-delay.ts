import { IAnimation } from "./pixi-animation";

export class AnimationDelay implements IAnimation {
  IsCompleted: boolean;
  OnCompleted?: () => void;
  protected durationRemains: number;

  constructor(durationInMs: number, onCompleted?: () => void) {
    this.durationRemains = durationInMs;
    this.IsCompleted = false;
    this.OnCompleted = onCompleted;
  }

  Update(elapsedMs: number): void {
    if (this.durationRemains > elapsedMs) {
      this.durationRemains -= elapsedMs;
    } else {
      // Here is final call
      this.IsCompleted = true;
      this.durationRemains = 0;
    }
  }
}
