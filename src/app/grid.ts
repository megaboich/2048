
class GridState {
    Size: number;
    Cells: number[][];
}

class TilePosition {
    X: number;
    Y: number;
    constructor(x: number, y: number) {
        this.X = x;
        this.Y = y;
    }
}

class Grid extends GridState {
    constructor(size: number, savedState: GridState = null) {
        super();

        this.Size = (savedState == null)
            ? size
            : savedState.Size;

        this.Cells = new Array(this.Size);
        for (var ix = 0; ix < this.Size; ix++) {
            this.Cells[ix] = new Array(this.Size);

            for (var iy = 0; iy < this.Size; iy++) {
                this.Cells[ix][iy] = (savedState == null)
                    ? 0
                    : savedState.Cells[ix][iy];
            }
        }
    }

    InsertTile(x: number, y: number, value: number): void {
        if (x < 0) {
            throw "X position " + x + "is < 0";
        }

        if (y < 0) {
            throw "Y position " + y + "is < 0";
        }

        if (x >= this.Size) {
            throw "X position " + x + "is more than grid size";
        }

        if (y >= this.Size) {
            throw "Y position " + y + "is more than grid size";
        }

        if (this.Cells[x][y] != 0) {
            throw "Cell with position " + x + ", " + y + " is occupied";
        }

        this.Cells[x][y] = value;
    }

    RemoveTile(x: number, y: number): void {
        this.Cells[x][y] = 0;
    }

    AvailableCells(): TilePosition[] {
        var availPositions: Array<TilePosition> = [];

        for (var ix = 0; ix < this.Size; ++ix) {
            for (var iy = 0; iy < this.Size; ++iy) {
                if (this.Cells[ix][iy] == 0) {
                    availPositions.push(new TilePosition(ix, iy));
                }
            }
        }

        return availPositions;
    }
}