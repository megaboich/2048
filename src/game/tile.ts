export interface TilePosition {
  rowIndex: number;
  cellIndex: number;
}

export interface Tile extends TilePosition {
  value: number;
}

export function buildTile(
  rowIndex: number,
  colIndex: number,
  value: number
): Tile {
  return {
    rowIndex: rowIndex,
    cellIndex: colIndex,
    value: value
  };
}
