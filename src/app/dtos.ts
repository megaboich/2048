
class TilePosition {
    RowIndex: number;
    CellIndex: number;
    constructor(row: number, cell: number) {
        this.RowIndex = row;
        this.CellIndex = cell;
    }

    toString(): string {
        return `[${this.RowIndex},${this.CellIndex}]`;
    }
}

class Tile extends TilePosition {
    Value: number;

    constructor(row: number, cell: number, value: number) {
        super(row, cell);
        this.Value = value;
    }
}

class RowProcessionEvent {
    OldIndex: number;
    NewIndex: number;
    Value: number;
    MergedValue: number;

    constructor(oldIndex: number, newIndex: number, value: number, mergedValue: number = 0) {
        this.OldIndex = oldIndex;
        this.NewIndex = newIndex;
        this.MergedValue = mergedValue;
        this.Value = value;
    }

    IsDeleted(): boolean {
        return (this.MergedValue < 0);
    }

    IsMerged(): boolean {
        return (this.MergedValue > 0);
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
    ShouldBeDeleted: boolean;

    constructor(oldPosition: TilePosition, newPosition: TilePosition, value: number, shouldBeDeleted: boolean) {
        super(oldPosition);
        this.NewPosition = newPosition;
        this.Value = value;
        this.ShouldBeDeleted = shouldBeDeleted;
    }
}

class TileCreatedEvent extends TileUpdateEvent {
    TileValue: number;

    constructor(position: TilePosition, tileValue: number) {
        super(position);
        this.TileValue = tileValue;
    }
}
