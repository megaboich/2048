///<reference path="enums.ts"/>
///<reference path="dtos.ts"/>

class Grid {
    Size: number;
    Cells: number[][];

    constructor(size: number) {
        this.Size = size;
        this.Cells = new Array(this.Size);
        for (var irow = 0; irow < this.Size; irow++) {
            this.Cells[irow] = new Array(this.Size);
            for (var icell = 0; icell < this.Size; icell++) {
                this.Cells[irow][icell] = 0;
            }
        }
    }

    Serialize(): string {
        var result = <string[]>[];
        for (var irow = 0; irow < this.Size; ++irow) {
            result.push(this.Cells[irow].join(','))
        }
        return result.join('|');
    }

    static Deserialize(state: string): Grid {
        var grid = new Grid(1);
        grid.InitFromState(state);
        return grid;
    }

    protected InitFromState(state: string) {
        var rowsData = state.split("|");

        this.Size = rowsData.length;
        this.Cells = <number[][]>[];
        for (var irow = 0; irow < this.Size; ++irow) {
            var row = <number[]>[];
            this.Cells.push(row);
            var cellsData = rowsData[irow].split(",");
            if (cellsData.length != this.Size) {
                throw 'Incorrect serialized grid state';
            }
            for (var icell = 0; icell < this.Size; ++icell) {
                row.push(parseInt(cellsData[icell], 10));
            }
        }
    }

    InsertTileByPos(pos: TilePosition, value: number): void {
        this.InsertTile(pos.RowIndex, pos.CellIndex, value);
    }

    InsertTile(irow: number, icell: number, value: number): void {
        if (irow < 0) {
            throw "X position " + irow + "is < 0";
        }

        if (icell < 0) {
            throw "Y position " + icell + "is < 0";
        }

        if (irow >= this.Size) {
            throw "X position " + irow + "is more than grid size";
        }

        if (icell >= this.Size) {
            throw "Y position " + icell + "is more than grid size";
        }

        if (this.Cells[irow][icell] != 0) {
            throw "Cell with position " + irow + ", " + icell + " is occupied";
        }

        this.Cells[irow][icell] = value;
    }

    RemoveTile(irow: number, icell: number): void {
        this.Cells[irow][icell] = 0;
    }
    
    RemoveTileByPos(pos: TilePosition):void{
        this.RemoveTile(pos.RowIndex, pos.CellIndex);
    }

    GetTile(irow: number, icell: number): Tile {
        return new Tile(irow, icell, this.Cells[irow][icell]);
    }

    UpdateTileByPos(pos: TilePosition, newValue: number){
        this.Cells[pos.RowIndex][pos.CellIndex] = newValue;
    }

    AvailableCells(): TilePosition[] {
        var availPositions: Array<TilePosition> = [];

        for (var irow = 0; irow < this.Size; ++irow) {
            for (var icell = 0; icell < this.Size; ++icell) {
                if (this.Cells[irow][icell] == 0) {
                    availPositions.push(new TilePosition(irow, icell));
                }
            }
        }

        return availPositions;
    }

    GetRowDataByDirection(move: Direction): Tile[][] {
        var result = <Tile[][]>[];

        switch (move) {
            case Direction.Left:
                for (var irow = 0; irow < this.Size; ++irow) {
                    var row = <Tile[]>[];
                    for (var icell = 0; icell < this.Size; ++icell) {
                        row.push(this.GetTile(irow, icell));
                    }
                    result.push(row);
                }
                break
            case Direction.Right:
                for (var irow = 0; irow < this.Size; ++irow) {
                    var row = <Tile[]>[];
                    for (var icell = 0; icell < this.Size; ++icell) {
                        row.push(this.GetTile(irow, this.Size - icell - 1));
                    }
                    result.push(row);
                }
                break;
            case Direction.Up:
                for (var icell = 0; icell < this.Size; ++icell) {
                    var row = <Tile[]>[];
                    for (var irow = 0; irow < this.Size; ++irow) {
                        row.push(this.GetTile(irow, icell));
                    }
                    result.push(row);
                }
                break;
            case Direction.Down:
                for (var icell = 0; icell < this.Size; ++icell) {
                    var row = <Tile[]>[];
                    for (var irow = 0; irow < this.Size; ++irow) {
                        row.push(this.GetTile(this.Size - irow - 1, icell));
                    }
                    result.push(row);
                }
                break;
        }
        return result;
    }
}
