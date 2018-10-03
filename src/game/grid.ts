import { Direction } from "./enums";
import { Tile, TilePosition } from "./tile";

export class Grid {
  size: number;
  cells: number[][];

  constructor(size: number) {
    this.size = size;
    this.cells = new Array(this.size);
    for (let irow = 0; irow < this.size; irow++) {
      this.cells[irow] = new Array(this.size);
      for (let icell = 0; icell < this.size; icell++) {
        this.cells[irow][icell] = 0;
      }
    }
  }

  serialize(): string {
    const result = <string[]>[];
    for (let irow = 0; irow < this.size; ++irow) {
      result.push(this.cells[irow].join(","));
    }
    return result.join("|");
  }

  static deserialize(state: string): Grid {
    const grid = new Grid(1);
    grid.initFromState(state);
    return grid;
  }

  protected initFromState(state: string) {
    const rowsData = state.split("|");

    this.size = rowsData.length;
    this.cells = <number[][]>[];
    for (let irow = 0; irow < this.size; ++irow) {
      const row = <number[]>[];
      this.cells.push(row);
      const cellsData = rowsData[irow].split(",");
      if (cellsData.length != this.size) {
        throw new Error("Incorrect serialized grid state");
      }
      for (let icell = 0; icell < this.size; ++icell) {
        row.push(parseInt(cellsData[icell], 10));
      }
    }
  }

  public insertTileByPos(pos: TilePosition, value: number): void {
    this.insertTile(pos.rowIndex, pos.cellIndex, value);
  }

  public insertTile(irow: number, icell: number, value: number): void {
    if (irow < 0) {
      throw new Error("X position " + irow + "is < 0");
    }

    if (icell < 0) {
      throw new Error("Y position " + icell + "is < 0");
    }

    if (irow >= this.size) {
      throw new Error("X position " + irow + "is more than grid size");
    }

    if (icell >= this.size) {
      throw new Error("Y position " + icell + "is more than grid size");
    }

    if (this.cells[irow][icell] != 0) {
      throw new Error(
        "Cell with position " + irow + ", " + icell + " is occupied"
      );
    }

    this.cells[irow][icell] = value;
  }

  public removeTile(irow: number, icell: number): void {
    this.cells[irow][icell] = 0;
  }

  public removeTileByPos(pos: TilePosition): void {
    this.removeTile(pos.rowIndex, pos.cellIndex);
  }

  public getTile(irow: number, icell: number): Tile {
    return {
      rowIndex: irow,
      cellIndex: icell,
      value: this.cells[irow][icell]
    };
  }

  public updateTileByPos(pos: TilePosition, newValue: number) {
    this.cells[pos.rowIndex][pos.cellIndex] = newValue;
  }

  public availableCells(): TilePosition[] {
    const availPositions: TilePosition[] = [];

    for (let irow = 0; irow < this.size; ++irow) {
      for (let icell = 0; icell < this.size; ++icell) {
        if (this.cells[irow][icell] == 0) {
          availPositions.push({ rowIndex: irow, cellIndex: icell });
        }
      }
    }

    return availPositions;
  }

  public getRowDataByDirection(move: Direction): Tile[][] {
    const result = <Tile[][]>[];

    switch (move) {
      case Direction.Left:
        for (let irow = 0; irow < this.size; ++irow) {
          const row = <Tile[]>[];
          for (let icell = 0; icell < this.size; ++icell) {
            row.push(this.getTile(irow, icell));
          }
          result.push(row);
        }
        break;
      case Direction.Right:
        for (let irow = 0; irow < this.size; ++irow) {
          const row = <Tile[]>[];
          for (let icell = 0; icell < this.size; ++icell) {
            row.push(this.getTile(irow, this.size - icell - 1));
          }
          result.push(row);
        }
        break;
      case Direction.Up:
        for (let icell = 0; icell < this.size; ++icell) {
          const row = <Tile[]>[];
          for (let irow = 0; irow < this.size; ++irow) {
            row.push(this.getTile(irow, icell));
          }
          result.push(row);
        }
        break;
      case Direction.Down:
        for (let icell = 0; icell < this.size; ++icell) {
          const row = <Tile[]>[];
          for (let irow = 0; irow < this.size; ++irow) {
            row.push(this.getTile(this.size - irow - 1, icell));
          }
          result.push(row);
        }
        break;
    }
    return result;
  }
}
