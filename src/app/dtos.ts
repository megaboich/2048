
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

class TilesUpdateEvent {

}
