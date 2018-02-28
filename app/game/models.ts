export class TilePosition {
  rowIndex: number;
  cellIndex: number;
  constructor(row: number, cell: number) {
    this.rowIndex = row;
    this.cellIndex = cell;
  }

  toString(): string {
    return `[${this.rowIndex},${this.cellIndex}]`;
  }
}

export class Tile extends TilePosition {
  value: number;

  constructor(row: number, cell: number, value: number) {
    super(row, cell);
    this.value = value;
  }
}
