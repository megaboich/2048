import { TilePosition } from "./tile";

export class RowProcessionEvent {
  oldIndex: number;
  newIndex: number;
  value: number;
  mergedValue: number;

  constructor(
    oldIndex: number,
    newIndex: number,
    value: number,
    mergedValue: number = 0
  ) {
    this.oldIndex = oldIndex;
    this.newIndex = newIndex;
    this.mergedValue = mergedValue;
    this.value = value;
  }

  isDeleted(): boolean {
    return this.mergedValue < 0;
  }

  isMerged(): boolean {
    return this.mergedValue > 0;
  }
}

export class TileUpdateEvent {
  position: TilePosition;

  constructor(position: TilePosition) {
    this.position = position;
  }
}

export class TileMergeEvent extends TileUpdateEvent {
  tilePosToMergeWith: TilePosition;
  newValue: number;

  constructor(
    oldPosition: TilePosition,
    mergePosition: TilePosition,
    newValue: number
  ) {
    super(oldPosition);
    this.tilePosToMergeWith = mergePosition;
    this.newValue = newValue;
  }
}

export class TileMoveEvent extends TileUpdateEvent {
  newPosition: TilePosition;
  value: number;
  shouldBeDeleted: boolean;

  constructor(
    oldPosition: TilePosition,
    newPosition: TilePosition,
    value: number,
    shouldBeDeleted: boolean
  ) {
    super(oldPosition);
    this.newPosition = newPosition;
    this.value = value;
    this.shouldBeDeleted = shouldBeDeleted;
  }
}

export class TileCreatedEvent extends TileUpdateEvent {
  tileValue: number;

  constructor(position: TilePosition, tileValue: number) {
    super(position);
    this.tileValue = tileValue;
  }
}
