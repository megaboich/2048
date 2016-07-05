
export class TilePosition {
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

export class Tile extends TilePosition {
    Value: number;

    constructor(row: number, cell: number, value: number) {
        super(row, cell);
        this.Value = value;
    }
}
