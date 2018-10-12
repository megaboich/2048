import { Direction } from "./enums";

export interface StartNewGameAction {
  type: "START";
}

export interface MoveAction {
  type: "MOVE";
  direction: Direction;
}

export type Action = StartNewGameAction | MoveAction;
