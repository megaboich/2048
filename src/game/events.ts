import { TilePosition, Tile } from "./tile";

export class GameEvent {}

export class TileMergeEvent extends GameEvent {
  constructor(
    public oldPosition: TilePosition,
    public mergePosition: TilePosition,
    public newValue: number
  ) {
    super();
  }
}

export class TileMoveEvent extends GameEvent {
  constructor(
    public oldPosition: TilePosition,
    public newPosition: TilePosition,
    public value: number,
    public shouldBeDeleted: boolean
  ) {
    super();
  }
}

export class TileCreatedEvent extends GameEvent {
  constructor(public tile: Tile) {
    super();
  }
}

export class TilesNotMovedEvent extends GameEvent {}

export class GameOverEvent extends GameEvent {}
