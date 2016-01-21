///<reference path="grid.ts"/>
///<reference path="helpers/observable.ts"/>

enum MoveDirection{
    Up,
    Down,
    Right,
    Left
}

class TilesUpdateEvent{
    
}

class Game2048 {
    Scores: number = 0;
    Grid: Grid;
    OnTilesUpdate: Observable<TilesUpdateEvent> = new Observable<TilesUpdateEvent>(); 

    constructor(size: number) {
        this.Grid = new Grid(size);
    }

    ProcessInputAction(move: MoveDirection) {
        var event = new TilesUpdateEvent();
        this.OnTilesUpdate.NotifyObservers(event);
        
        ++this.Scores;
        
        var availTitles = this.Grid.AvailableCells();
        if (availTitles.length > 0) {
            var ti = Math.floor((Math.random() * availTitles.length) + 1);
            var pos = availTitles[ti];
            
            this.Grid.InsertTile(pos.X, pos.Y, 2);
        }
    }
}
