import { Direction } from "./enums";

export interface StartNewGameAction {
  type: "START";
  serializedState: string;
}

export interface MoveAction {
  type: "MOVE";
  direction: Direction;
}

export type Action = StartNewGameAction | MoveAction;
