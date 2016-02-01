///<reference path="helpers/observable.ts"/>
///<reference path="helpers/random.ts"/>
///<reference path="grid.ts"/>
///<reference path="row-processor.ts"/>

interface IGame2048Render {
    OnGameFinished(): void;
    OnTilesUpdated(event: TileUpdateEvent): void;
}

class Game2048 {
    Scores: number = 0;
    Grid: Grid;
    OnTilesUpdated: Observable<TileUpdateEvent> = new Observable<TileUpdateEvent>();
    OnGameFinished: Observable<void> = new Observable<void>();

    constructor(size: number) {
        this.Grid = new Grid(size);
        this.insertNewTileToVacantSpace();
    }

    BindRender(render: IGame2048Render) {
        this.OnTilesUpdated.RegisterObserver(render.OnTilesUpdated.bind(render));
        this.OnGameFinished.RegisterObserver(render.OnGameFinished.bind(render));
    }

    ProcessInputAction(move: Direction) {
        var rowsData = this.Grid.GetRowDataByDirection(move);
        for (var i = 0; i < rowsData.length; ++i) {
            var rowEvents = RowProcessor.ProcessRow(rowsData[i]);

            //apply row events to game grid and publish them to subscribers
            for (var ie = 0; ie < rowEvents.length; ++ie) {
                var rowEvent = rowEvents[ie];
                var oldPos = rowsData[i][rowEvent.OldIndex];
                var newPos = rowsData[i][rowEvent.NewIndex];
                if (rowEvent.IsMerged) {
                    this.Scores += rowEvent.MergedValue;
                    this.Grid.UpdateTileByPos(rowsData[i][rowEvent.NewIndex], rowEvent.MergedValue);
                    this.OnTilesUpdated.NotifyObservers(new TileMergeEvent(oldPos, newPos));
                } else {
                    this.Grid.UpdateTileByPos(newPos, rowEvent.OldValue);
                    this.OnTilesUpdated.NotifyObservers(new TileMoveEvent(oldPos, newPos));
                }

                this.Grid.RemoveTileByPos(oldPos);
            }
        }

        var newTile = this.insertNewTileToVacantSpace();
        if (newTile != null) {
            this.OnTilesUpdated.NotifyObservers(new TileCreatedEvent(newTile));
        }
        else {
            this.OnGameFinished.NotifyObservers(null);
        }
    }

    private insertNewTileToVacantSpace(): Tile {
        var availTitles = this.Grid.AvailableCells();
        if (availTitles.length > 0) {
            var ti = Random.GetRandomInt(0, availTitles.length);
            var pos = availTitles[ti];
            var tile = new Tile(pos.RowIndex, pos.CellIndex, 2);
            this.Grid.InsertTile(tile);
            return tile;
        }

        return null;
    }
}
