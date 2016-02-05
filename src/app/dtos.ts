
class TilePosition {
    RowIndex: number;
    CellIndex: number;
    constructor(row: number, cell: number) {
        this.RowIndex = row;
        this.CellIndex = cell;
    }
}

class Tile extends TilePosition {
    Value: number;

    constructor(row: number, cell: number, value: number) {
        super(row, cell);
        this.Value = value;
    }
}

class ProcessionEvent {
    OldIndex: number;
    NewIndex: number;
    IsMerged: boolean;
    OldValue: number;
    MergedValue: number;

    constructor(oldIndex: number, newIndex: number, oldValue: number, mergedValue: number = 0) {
        this.OldIndex = oldIndex;
        this.NewIndex = newIndex;
        this.MergedValue = mergedValue;
        this.OldValue = oldValue;
        this.IsMerged = (this.MergedValue > 0);
    }
}

class TileUpdateEvent {
    Position: TilePosition;
    constructor(position: TilePosition) {
        this.Position = position;
    }
}

class TileMergeEvent extends TileUpdateEvent {
    TilePosToMergeWith: TilePosition;
    NewValue: number;
    constructor(oldPosition: TilePosition, mergePosition: TilePosition, newValue: number) {
        super(oldPosition);
        this.TilePosToMergeWith = mergePosition;
        this.NewValue = newValue;
    }
}

class TileMoveEvent extends TileUpdateEvent {
    NewPosition: TilePosition;
    Value: number;
    constructor(oldPosition: TilePosition, newPosition: TilePosition, value: number) {
        super(oldPosition);
        this.NewPosition = newPosition;
        this.Value = value;
    }
}

class TileCreatedEvent extends TileUpdateEvent {
    TileValue: number;
    constructor(position: TilePosition, tileValue: number) {
        super(position);
        this.TileValue = tileValue;
    }
}
