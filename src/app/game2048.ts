///<reference path="helpers/observable.ts"/>
///<reference path="helpers/random.ts"/>
///<reference path="grid.ts"/>
///<reference path="row-processor.ts"/>

class Game2048 {
    Scores: number = 0;
    Grid: Grid;
    OnTilesUpdate: Observable<TilesUpdateEvent> = new Observable<TilesUpdateEvent>();

    constructor(size: number) {
        this.Grid = new Grid(size);
        this.insertNewTileToVacantSpace();
    }

    ProcessInputAction(move: Direction) {
        var rowsData = this.Grid.GetRowDataByDirection(move);
        for (var i = 0; i < rowsData.length; ++i) {
            var rowEvents = RowProcessor.ProcessRow(rowsData[i]);

            //apply row events to game grid and publish them to subscribers
            for (var ie = 0; ie < rowEvents.length; ++ie) {
                var rowEvent = rowEvents[ie];
                if (rowEvent.IsMerged){
                    this.Scores += rowEvent.MergedValue;
                    this.Grid.UpdateTileByPos(rowsData[i][rowEvent.NewIndex], rowEvent.MergedValue);
                    
                    // Fire tile merged event
                    // TODO: 
                } else{
                    this.Grid.UpdateTileByPos(rowsData[i][rowEvent.NewIndex], rowEvent.OldValue);
                    
                    // Fire tile moved event
                    // TODO:
                }
                this.Grid.RemoveTileByPos(rowsData[i][rowEvent.OldIndex]);
            }
        }

        this.insertNewTileToVacantSpace();
        
        // Fire new tile appeared event
        // TODO:
        var event = new TilesUpdateEvent();
        this.OnTilesUpdate.NotifyObservers(event);
    }

    private insertNewTileToVacantSpace(): void {
        var availTitles = this.Grid.AvailableCells();
        if (availTitles.length > 0) {
            var ti = Random.GetRandomInt(0, availTitles.length);
            var pos = availTitles[ti];
            this.Grid.InsertTile(pos.RowIndex, pos.CellIndex, 2);
        }
    }
}
