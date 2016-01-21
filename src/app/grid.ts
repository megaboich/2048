
class GridState{
    size: number;
    cells: number[][];
}

class TilePosition{
    x:number;
    y:number;
    constructor(x:number, y:number){
        this.x = x;
        this.y = y;
    }
}

class Grid extends GridState{
    constructor(size: number, savedState: GridState = null)
    {
        super();
        
        this.size = (savedState == null)
            ? size
            : savedState.size;
        
        this.cells = new Array(this.size);
        for(var ix=0; ix < this.size; ix++){
            this.cells[ix] = new Array(this.size);
            
            for(var iy=0; iy < this.size; iy++){
                this.cells[ix][iy] = (savedState == null)
                    ? 0
                    : savedState.cells[ix][iy];
            }
        }
    }
    
    insertTile(x: number, y:number, value:number):void 
    {
        this.cells[x][y] = value;
    }

    removeTile(x: number, y:number):void 
    {
        this.cells[x][y] = 0;
    }
    
    availableCells():TilePosition[]
    {
        var availPositions:Array<TilePosition> = [];
        
        for(var ix = 0; ix < this.size; ++ix){
            for(var iy = 0; iy < this.size; ++iy){
                if (this.cells[ix][iy] == 0){
                    availPositions.push(new TilePosition(ix, iy));
                }
            }
        }
        
        return availPositions; 
    }
}