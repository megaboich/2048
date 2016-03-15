var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Observable = (function () {
    function Observable() {
        this.observers = [];
    }
    Observable.prototype.RegisterObserver = function (observer) {
        this.observers.push(observer);
    };
    Observable.prototype.RemoveObserver = function (observer) {
        this.observers.splice(this.observers.indexOf(observer), 1);
    };
    Observable.prototype.NotifyObservers = function (arg) {
        this.observers.forEach(function (observer) {
            observer(arg);
        });
    };
    return Observable;
}());
// Helper static class for working with random
var RandomHelper = (function () {
    function RandomHelper() {
    }
    // Returns a random integer between min (included) and max (included)
    // Using Math.round() will give you a non-uniform distribution!
    RandomHelper.GetRandomIntInclusive = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    // Returns a random integer between min (included) and max (excluded)
    // Using Math.round() will give you a non-uniform distribution!
    RandomHelper.GetRandomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    };
    RandomHelper.GetRandColor = function () {
        var r = this.GetRandomInt(120, 255);
        var g = this.GetRandomInt(120, 255);
        var b = this.GetRandomInt(120, 255);
        return b + 256 * g + 256 * 256 * r;
    };
    return RandomHelper;
}());
var DefaultRandom = (function () {
    function DefaultRandom() {
    }
    DefaultRandom.prototype.GetRandomNumber = function (max) {
        return RandomHelper.GetRandomInt(0, max);
    };
    return DefaultRandom;
}());
var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 0] = "Up";
    Direction[Direction["Down"] = 1] = "Down";
    Direction[Direction["Right"] = 2] = "Right";
    Direction[Direction["Left"] = 3] = "Left";
})(Direction || (Direction = {}));
var TilePosition = (function () {
    function TilePosition(row, cell) {
        this.RowIndex = row;
        this.CellIndex = cell;
    }
    TilePosition.prototype.toString = function () {
        return "[" + this.RowIndex + "," + this.CellIndex + "]";
    };
    return TilePosition;
}());
var Tile = (function (_super) {
    __extends(Tile, _super);
    function Tile(row, cell, value) {
        _super.call(this, row, cell);
        this.Value = value;
    }
    return Tile;
}(TilePosition));
var RowProcessionEvent = (function () {
    function RowProcessionEvent(oldIndex, newIndex, value, mergedValue) {
        if (mergedValue === void 0) { mergedValue = 0; }
        this.OldIndex = oldIndex;
        this.NewIndex = newIndex;
        this.MergedValue = mergedValue;
        this.Value = value;
    }
    RowProcessionEvent.prototype.IsDeleted = function () {
        return (this.MergedValue < 0);
    };
    RowProcessionEvent.prototype.IsMerged = function () {
        return (this.MergedValue > 0);
    };
    return RowProcessionEvent;
}());
var TileUpdateEvent = (function () {
    function TileUpdateEvent(position) {
        this.Position = position;
    }
    return TileUpdateEvent;
}());
var TileMergeEvent = (function (_super) {
    __extends(TileMergeEvent, _super);
    function TileMergeEvent(oldPosition, mergePosition, newValue) {
        _super.call(this, oldPosition);
        this.TilePosToMergeWith = mergePosition;
        this.NewValue = newValue;
    }
    return TileMergeEvent;
}(TileUpdateEvent));
var TileMoveEvent = (function (_super) {
    __extends(TileMoveEvent, _super);
    function TileMoveEvent(oldPosition, newPosition, value, shouldBeDeleted) {
        _super.call(this, oldPosition);
        this.NewPosition = newPosition;
        this.Value = value;
        this.ShouldBeDeleted = shouldBeDeleted;
    }
    return TileMoveEvent;
}(TileUpdateEvent));
var TileCreatedEvent = (function (_super) {
    __extends(TileCreatedEvent, _super);
    function TileCreatedEvent(position, tileValue) {
        _super.call(this, position);
        this.TileValue = tileValue;
    }
    return TileCreatedEvent;
}(TileUpdateEvent));
///<reference path="enums.ts"/>
///<reference path="dtos.ts"/>
var Grid = (function () {
    function Grid(size) {
        this.Size = size;
        this.Cells = new Array(this.Size);
        for (var irow = 0; irow < this.Size; irow++) {
            this.Cells[irow] = new Array(this.Size);
            for (var icell = 0; icell < this.Size; icell++) {
                this.Cells[irow][icell] = 0;
            }
        }
    }
    Grid.prototype.Serialize = function () {
        var result = [];
        for (var irow = 0; irow < this.Size; ++irow) {
            result.push(this.Cells[irow].join(','));
        }
        return result.join('|');
    };
    Grid.Deserialize = function (state) {
        var grid = new Grid(1);
        grid.InitFromState(state);
        return grid;
    };
    Grid.prototype.InitFromState = function (state) {
        var rowsData = state.split("|");
        this.Size = rowsData.length;
        this.Cells = [];
        for (var irow = 0; irow < this.Size; ++irow) {
            var row = [];
            this.Cells.push(row);
            var cellsData = rowsData[irow].split(",");
            if (cellsData.length != this.Size) {
                throw 'Incorrect serialized grid state';
            }
            for (var icell = 0; icell < this.Size; ++icell) {
                row.push(parseInt(cellsData[icell], 10));
            }
        }
    };
    Grid.prototype.InsertTileByPos = function (pos, value) {
        this.InsertTile(pos.RowIndex, pos.CellIndex, value);
    };
    Grid.prototype.InsertTile = function (irow, icell, value) {
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
    };
    Grid.prototype.RemoveTile = function (irow, icell) {
        this.Cells[irow][icell] = 0;
    };
    Grid.prototype.RemoveTileByPos = function (pos) {
        this.RemoveTile(pos.RowIndex, pos.CellIndex);
    };
    Grid.prototype.GetTile = function (irow, icell) {
        return new Tile(irow, icell, this.Cells[irow][icell]);
    };
    Grid.prototype.UpdateTileByPos = function (pos, newValue) {
        this.Cells[pos.RowIndex][pos.CellIndex] = newValue;
    };
    Grid.prototype.AvailableCells = function () {
        var availPositions = [];
        for (var irow = 0; irow < this.Size; ++irow) {
            for (var icell = 0; icell < this.Size; ++icell) {
                if (this.Cells[irow][icell] == 0) {
                    availPositions.push(new TilePosition(irow, icell));
                }
            }
        }
        return availPositions;
    };
    Grid.prototype.GetRowDataByDirection = function (move) {
        var result = [];
        switch (move) {
            case Direction.Left:
                for (var irow = 0; irow < this.Size; ++irow) {
                    var row = [];
                    for (var icell = 0; icell < this.Size; ++icell) {
                        row.push(this.GetTile(irow, icell));
                    }
                    result.push(row);
                }
                break;
            case Direction.Right:
                for (var irow = 0; irow < this.Size; ++irow) {
                    var row = [];
                    for (var icell = 0; icell < this.Size; ++icell) {
                        row.push(this.GetTile(irow, this.Size - icell - 1));
                    }
                    result.push(row);
                }
                break;
            case Direction.Up:
                for (var icell = 0; icell < this.Size; ++icell) {
                    var row = [];
                    for (var irow = 0; irow < this.Size; ++irow) {
                        row.push(this.GetTile(irow, icell));
                    }
                    result.push(row);
                }
                break;
            case Direction.Down:
                for (var icell = 0; icell < this.Size; ++icell) {
                    var row = [];
                    for (var irow = 0; irow < this.Size; ++irow) {
                        row.push(this.GetTile(this.Size - irow - 1, icell));
                    }
                    result.push(row);
                }
                break;
        }
        return result;
    };
    return Grid;
}());
///<reference path="dtos.ts"/>
var RowProcessor = (function () {
    function RowProcessor() {
    }
    RowProcessor.ProcessRow = function (tiles) {
        var valueToMerge = tiles[0].Value;
        var availableCellIndex = tiles[0].Value > 0 ? 1 : 0;
        var resultEvents = [];
        var moveEventBeforeMerge = null;
        for (var ir = 1; ir < tiles.length; ++ir) {
            var current = tiles[ir].Value;
            if (current == 0) {
                // Skip zeros
                continue;
            }
            if (valueToMerge != current) {
                if (ir > availableCellIndex) {
                    // Move case
                    moveEventBeforeMerge = new RowProcessionEvent(ir, availableCellIndex, current);
                    resultEvents.push(moveEventBeforeMerge);
                }
                valueToMerge = current;
                ++availableCellIndex;
                continue;
            }
            // Merge case (accumulatedValue != current)
            // If we do merge after move then
            if (moveEventBeforeMerge != null) {
                moveEventBeforeMerge.MergedValue = -1;
            }
            else {
                // Fake move event just for deletion 
                resultEvents.push(new RowProcessionEvent(availableCellIndex - 1, availableCellIndex - 1, current, -1));
            }
            resultEvents.push(new RowProcessionEvent(ir, availableCellIndex - 1, current, current + valueToMerge));
            valueToMerge = 0; // Don't allow all merges in one turn
        }
        return resultEvents;
    };
    return RowProcessor;
}());
///<reference path="helpers/observable.ts"/>
///<reference path="helpers/random.ts"/>
///<reference path="grid.ts"/>
///<reference path="row-processor.ts"/>
var Game2048 = (function () {
    function Game2048(size, rand) {
        this.Scores = 0;
        this.OnTilesUpdated = new Observable();
        this.OnGameFinished = new Observable();
        this.userActionsQueue = [];
        this.rand = rand;
        this.Grid = new Grid(size);
        this.insertNewTileToVacantSpace();
    }
    Game2048.prototype.BindRender = function (render) {
        this.OnTilesUpdated.RegisterObserver(render.OnTilesUpdated.bind(render));
        this.OnGameFinished.RegisterObserver(render.OnGameFinished.bind(render));
        render.OnTurnAnimationsCompleted.RegisterObserver(this.fetchAndExecuteUserActionFromQueue.bind(this));
    };
    Game2048.prototype.Serialize = function () {
        var state = {
            Scores: this.Scores,
            GridSerialized: this.Grid.Serialize()
        };
        return JSON.stringify(state);
    };
    Game2048.prototype.InitFromState = function (gameState) {
        var state = JSON.parse(gameState);
        this.Scores = state.Scores;
        this.Grid = Grid.Deserialize(state.GridSerialized);
    };
    Game2048.prototype.Action = function (move) {
        var action = this.processAction.bind(this, move);
        this.userActionsQueue.push(action);
        if (this.userActionsQueue.length == 1) {
            action();
        }
    };
    Game2048.prototype.fetchAndExecuteUserActionFromQueue = function () {
        this.userActionsQueue.splice(0, 1);
        if (this.userActionsQueue.length > 0) {
            var action = this.userActionsQueue[0];
            action();
        }
    };
    Game2048.prototype.calculateGameEvents = function (move) {
        var allEvents = [];
        var rowsData = this.Grid.GetRowDataByDirection(move);
        for (var i = 0; i < rowsData.length; ++i) {
            var rowEvents = RowProcessor.ProcessRow(rowsData[i]);
            //apply row events to game grid and publish them to subscribers
            for (var ie = 0; ie < rowEvents.length; ++ie) {
                var rowEvent = rowEvents[ie];
                var oldPos = rowsData[i][rowEvent.OldIndex];
                var newPos = rowsData[i][rowEvent.NewIndex];
                if (rowEvent.IsMerged()) {
                    allEvents.push(new TileMergeEvent(oldPos, newPos, rowEvent.MergedValue));
                }
                else {
                    allEvents.push(new TileMoveEvent(oldPos, newPos, rowEvent.Value, rowEvent.IsDeleted()));
                }
            }
        }
        return allEvents;
    };
    Game2048.prototype.processAction = function (move) {
        CommonTools.ConsoleLog("start process action", [this.Grid.Serialize(), Direction[move]]);
        var gameEvents = this.calculateGameEvents(move);
        for (var i = 0; i < gameEvents.length; ++i) {
            var event = gameEvents[i];
            if (event instanceof TileMoveEvent) {
                var moveEvent = event;
                this.Grid.UpdateTileByPos(moveEvent.NewPosition, moveEvent.Value);
                this.Grid.RemoveTileByPos(moveEvent.Position);
            }
            if (event instanceof TileMergeEvent) {
                var mergeEvent = event;
                this.Grid.UpdateTileByPos(mergeEvent.TilePosToMergeWith, mergeEvent.NewValue);
                this.Grid.RemoveTileByPos(mergeEvent.Position);
                this.Scores += mergeEvent.NewValue;
            }
            this.OnTilesUpdated.NotifyObservers(event);
        }
        if (gameEvents.length > 0) {
            // If we have events then there were some movements and therefore there must be some empty space to insert new tile
            var newTile = this.insertNewTileToVacantSpace();
            this.OnTilesUpdated.NotifyObservers(new TileCreatedEvent(newTile, newTile.Value));
        }
        else {
            this.OnTilesUpdated.NotifyObservers(null); // Dummy event - just indicator that user made his action without movements
            // Here we need to check if game grid is full - so might be game is finished if there is no possibility to make a movement
            var availTitles = this.Grid.AvailableCells();
            if (availTitles.length == 0) {
                // Check if there are possible movements
                var weHaveSomePossibleEvents = this.calculateGameEvents(Direction.Up).length > 0
                    || this.calculateGameEvents(Direction.Right).length > 0
                    || this.calculateGameEvents(Direction.Left).length > 0
                    || this.calculateGameEvents(Direction.Down).length > 0;
                if (!weHaveSomePossibleEvents) {
                    // Game is over, dude
                    this.OnGameFinished.NotifyObservers(null);
                }
            }
        }
        CommonTools.ConsoleLog("  end process action", [this.Grid.Serialize()]);
    };
    Game2048.prototype.insertNewTileToVacantSpace = function () {
        var availTitles = this.Grid.AvailableCells();
        if (availTitles.length > 0) {
            var ti = this.rand.GetRandomNumber(availTitles.length);
            var pos = availTitles[ti];
            var tile = new Tile(pos.RowIndex, pos.CellIndex, 2);
            this.Grid.InsertTileByPos(tile, tile.Value);
            return tile;
        }
        return null;
    };
    return Game2048;
}());
var Dictionary = (function () {
    function Dictionary(init) {
        this._keys = [];
        this._values = [];
        for (var x = 0; x < init.length; x++) {
            this.Add(init[x].Key, init[x].Value);
        }
    }
    Dictionary.prototype.Add = function (key, value) {
        if (this[key.toString()] !== undefined) {
            throw "Item with key " + key + " has been already added to dictionary";
        }
        this[key.toString()] = value;
        this._keys.push(key);
        this._values.push(value);
    };
    Dictionary.prototype.Remove = function (key) {
        var index = this._keys.indexOf(key, 0);
        this._keys.splice(index, 1);
        this._values.splice(index, 1);
        delete this[key.toString()];
    };
    Dictionary.prototype.Keys = function () {
        return this._keys;
    };
    Dictionary.prototype.Values = function () {
        return this._values;
    };
    Dictionary.prototype.ContainsKey = function (key) {
        if (typeof this[key.toString()] === "undefined") {
            return false;
        }
        return true;
    };
    Dictionary.prototype.Get = function (key) {
        var val = this[key.toString()];
        if (val !== undefined) {
            return val;
        }
        throw "Key " + key + " is not found in dictionary";
    };
    return Dictionary;
}());
///<reference path="..\..\..\lib\typings\tsd.d.ts"/>
var PixiExtensions;
(function (PixiExtensions) {
    var AnimationBase = (function () {
        function AnimationBase(entity, durationInMs, onCompleted) {
            if (entity == null) {
                throw 'Entity is null';
            }
            this.Entity = entity;
            this.OnCompleted = onCompleted;
            this.durationRemains = durationInMs;
            this.IsCompleted = false;
        }
        return AnimationBase;
    }());
    PixiExtensions.AnimationBase = AnimationBase;
})(PixiExtensions || (PixiExtensions = {}));
///<reference path="pixi-animation.ts"/>
var PixiExtensions;
(function (PixiExtensions) {
    var AnimationParallel = (function () {
        function AnimationParallel(animations, onCompleted) {
            if (onCompleted === void 0) { onCompleted = null; }
            this.Animations = [];
            this.Animations = animations;
            this.OnCompleted = onCompleted;
            this.IsCompleted = false;
        }
        AnimationParallel.prototype.Update = function (elapsedMs) {
            if (this.Animations.length == 0) {
                return;
            }
            var completedEvents = [];
            var processedAnimations = this.Animations.filter(function (animation) {
                animation.Update(elapsedMs);
                if (animation.IsCompleted && animation.OnCompleted != null) {
                    completedEvents.push(animation.OnCompleted);
                }
                return !animation.IsCompleted;
            });
            this.Animations = processedAnimations;
            // call completed events
            completedEvents.forEach(function (e) { return e(); });
            if (this.Animations.length == 0) {
                this.IsCompleted = true;
            }
        };
        return AnimationParallel;
    }());
    PixiExtensions.AnimationParallel = AnimationParallel;
    var AnimationQueue = (function () {
        function AnimationQueue(animations, onCompleted) {
            if (onCompleted === void 0) { onCompleted = null; }
            this.Animations = [];
            this.Animations = animations;
            this.OnCompleted = onCompleted;
            this.IsCompleted = false;
        }
        AnimationQueue.prototype.Update = function (elapsedMs) {
            if (this.Animations.length == 0) {
                return;
            }
            var animation = this.Animations[0];
            animation.Update(elapsedMs);
            if (animation.IsCompleted) {
                if (animation.OnCompleted != null) {
                    animation.OnCompleted();
                }
                this.Animations.splice(0, 1);
            }
            if (this.Animations.length == 0) {
                this.IsCompleted = true;
            }
        };
        return AnimationQueue;
    }());
    PixiExtensions.AnimationQueue = AnimationQueue;
})(PixiExtensions || (PixiExtensions = {}));
///<reference path="pixi-animation-combined.ts"/>
var PixiExtensions;
(function (PixiExtensions) {
    var AnimationsManager = (function (_super) {
        __extends(AnimationsManager, _super);
        function AnimationsManager(onCompleted) {
            if (onCompleted === void 0) { onCompleted = null; }
            _super.call(this, [], onCompleted);
        }
        AnimationsManager.prototype.AddAnimation = function (animation) {
            this.Animations.push(animation);
        };
        AnimationsManager.prototype.Update = function (elapsedMs) {
            var hasAnimations = (this.Animations.length > 0);
            _super.prototype.Update.call(this, elapsedMs);
            if (hasAnimations && (this.Animations.length == 0)) {
                if (this.OnCompleted != null) {
                    this.OnCompleted();
                }
            }
        };
        return AnimationsManager;
    }(PixiExtensions.AnimationParallel));
    PixiExtensions.AnimationsManager = AnimationsManager;
})(PixiExtensions || (PixiExtensions = {}));
///<reference path="pixi-animation.ts"/>
var PixiExtensions;
(function (PixiExtensions) {
    var AnimationMove = (function (_super) {
        __extends(AnimationMove, _super);
        function AnimationMove(entity, durationInMs, newPosition, onCompleted) {
            if (onCompleted === void 0) { onCompleted = null; }
            _super.call(this, entity, durationInMs, onCompleted);
            this.TargetPosition = newPosition;
        }
        AnimationMove.prototype.Update = function (elapsedMs) {
            if (this.durationRemains > elapsedMs) {
                // Calculate dx and dy
                var dx = (elapsedMs * (this.TargetPosition.x - this.Entity.x)) / this.durationRemains;
                var dy = (elapsedMs * (this.TargetPosition.y - this.Entity.y)) / this.durationRemains;
                this.Entity.x += dx;
                this.Entity.y += dy;
                this.durationRemains -= elapsedMs;
            }
            else {
                // Here is final call
                this.Entity.x = this.TargetPosition.x;
                this.Entity.y = this.TargetPosition.y;
                this.IsCompleted = true;
                this.durationRemains = 0;
            }
        };
        return AnimationMove;
    }(PixiExtensions.AnimationBase));
    PixiExtensions.AnimationMove = AnimationMove;
})(PixiExtensions || (PixiExtensions = {}));
///<reference path="..\..\..\lib\typings\tsd.d.ts"/>
///<reference path="..\helpers\dictionary.ts"/>
///<reference path="pixi-animation-manager.ts"/>
///<reference path="pixi-animation-move.ts"/>
///<reference path="..\game2048.ts"/>
var PixiGameRender;
(function (PixiGameRender) {
    var TileSprite = (function (_super) {
        __extends(TileSprite, _super);
        function TileSprite() {
            _super.apply(this, arguments);
        }
        return TileSprite;
    }(PIXI.Container));
    PixiGameRender.TileSprite = TileSprite;
    var RenderHelper = (function () {
        function RenderHelper() {
        }
        RenderHelper.CreateTileSprite = function (irow, icell, tileValue, key) {
            //Create graphics for cell
            var tileSprite = new TileSprite();
            tileSprite.TileKey = key;
            tileSprite.width = this.TileSize;
            tileSprite.height = this.TileSize;
            var tileGraphics = new PIXI.Graphics;
            tileGraphics.lineStyle(1, 0xe0e0e0, 1);
            tileGraphics.beginFill(this.getTileBgColor(tileValue), 1);
            tileGraphics.drawRect(0, 0, this.TileSize, this.TileSize);
            tileGraphics.endFill();
            tileGraphics.x = -this.TileSizeHalf;
            tileGraphics.y = -this.TileSizeHalf;
            tileSprite.addChild(tileGraphics);
            var style = {
                font: this.getTileFontSize(tileValue) + ' Inconsolata, Courier New',
                fill: "#" + this.getTileTextColor(tileValue).toString(16)
            };
            var tileText = new PIXI.Text(tileValue.toString(), style);
            tileText.x = this.getTileTextXOffset(tileValue) - this.TileSizeHalf;
            tileText.y = this.getTileTextYOffset(tileValue) - this.TileSizeHalf;
            tileSprite.addChild(tileText);
            return tileSprite;
        };
        RenderHelper.CreateScoresText = function () {
            var style = {
                font: '32px Inconsolata, Courier New',
                fill: "#776E65"
            };
            var scoresText = new PIXI.Text("0", style);
            scoresText.x = this.TileSize;
            scoresText.y = 16;
            return scoresText;
        };
        RenderHelper.GreateGameOverGraphics = function () {
            var style = {
                font: '32px Inconsolata, Courier New',
                fill: "#776E65"
            };
            var text = new PIXI.Text("GAME OVER", style);
            text.x = this.TileSize;
            text.y = 46;
            return text;
        };
        RenderHelper.CreateOtherStatic = function (game) {
            // create frame
            var size = game.Grid.Size;
            var frame = new PIXI.Graphics();
            var border = 8;
            frame.lineStyle(1, 0xe0e0e0, 1);
            frame.drawRect(this.TileSize * 2 - border, this.TileSize * 2 - border, this.TileSize * size + border + border, this.TileSize * size + border + border);
            return frame;
        };
        RenderHelper.CalculateTileCoordinates = function (fig, iRow, iCell) {
            fig.x = this.TileSize * 2 + iCell * this.TileSize + this.TileSizeHalf;
            fig.y = this.TileSize * 2 + iRow * this.TileSize + this.TileSizeHalf;
        };
        RenderHelper.getTileFontSize = function (value) {
            if (value < 100) {
                return "32px";
            }
            if (value < 1000) {
                return "28px";
            }
            if (value < 10000) {
                return "22px";
            }
            return "18px";
        };
        RenderHelper.getTileTextXOffset = function (value) {
            if (value < 10) {
                return 17;
            }
            if (value < 100) {
                return 8;
            }
            if (value < 1000) {
                return 3;
            }
            return 2;
        };
        RenderHelper.getTileTextYOffset = function (value) {
            if (value < 100) {
                return 13;
            }
            if (value < 1000) {
                return 16;
            }
            return 17;
        };
        RenderHelper.getTileTextColor = function (value) {
            return value > 4
                ? 0xF9F6F2
                : 0x776E65;
        };
        RenderHelper.getTileBgColor = function (value) {
            switch (value) {
                case 2:
                    return 0xeee4da;
                case 4:
                    return 0xEDE0C8;
                case 8:
                    return 0xF2B179;
                case 16:
                    return 0xF59563;
                case 32:
                    return 0xF67C5F;
                case 64:
                    return 0xF65E3B;
                case 128:
                    return 0xEDCF72;
                case 256:
                    return 0xEDCC61;
                case 512:
                    return 0xEDC850;
                case 1024:
                    return 0xEDC53F;
                case 2048:
                    return 0xEDC22E;
                case 4096:
                    return 0xedc22e;
                case 8192:
                    return 0xedc22e;
                default:
                    return 0xedc22e;
            }
        };
        RenderHelper.TileSize = 50;
        RenderHelper.TileSizeHalf = 25;
        return RenderHelper;
    }());
    PixiGameRender.RenderHelper = RenderHelper;
})(PixiGameRender || (PixiGameRender = {}));
///<reference path="..\..\..\lib\typings\tsd.d.ts"/>
///<reference path="..\helpers\dictionary.ts"/>
///<reference path="pixi-animation-manager.ts"/>
///<reference path="pixi-animation-move.ts"/>
///<reference path="..\game2048.ts"/>
///<reference path="pixi-game-render-helper.ts"/>
var PixiGameRender;
(function (PixiGameRender) {
    var Render = (function () {
        function Render(document, game) {
            var _this = this;
            this.OnTurnAnimationsCompleted = new Observable();
            this.tiles = new Dictionary([]);
            this.staticRoot = null;
            this.game = game;
            var renderer = PIXI.autoDetectRenderer(400, 400, { backgroundColor: 0xeFeFeF });
            document.body.appendChild(renderer.view);
            // create the root of the scene graph
            this.stage = new PIXI.Container();
            this.RebuildGraphics();
            this.animationsManager = new PixiExtensions.AnimationsManager(this.onAnimationsCompleted.bind(this));
            var ticker = new PIXI.ticker.Ticker();
            ticker.add(function () {
                _this.animationsManager.Update(ticker.elapsedMS);
                renderer.render(_this.stage);
                _this.scoresText.text = game.Scores.toString();
                _this.fpsText.text = ticker.FPS.toFixed(2);
            });
            ticker.start();
        }
        Render.prototype.RebuildGraphics = function () {
            this.gameOverRendered = false;
            this.rebuildStaticObjects();
            this.rebuildDynamicObjects();
        };
        Render.prototype.OnGameFinished = function () {
            if (!this.gameOverRendered) {
                var gog = PixiGameRender.RenderHelper.GreateGameOverGraphics();
                this.staticRoot.addChild(gog);
            }
            this.gameOverRendered = true;
        };
        Render.prototype.OnTilesUpdated = function (event) {
            var _this = this;
            if (event === null) {
                // No tiles were moved
                this.animationsManager.AddAnimation(new PixiExtensions.AnimationQueue([
                    new PixiExtensions.AnimationScale(this.scoresText, 50, 1.3),
                    new PixiExtensions.AnimationScale(this.scoresText, 100, 1),
                ]));
            }
            if (event instanceof TileMoveEvent) {
                var moveEvent = event;
                var tileToMove = this.tiles.Get(this.getTileKey(moveEvent.Position));
                this.unregisterTile(tileToMove);
                this.bringToFront(tileToMove);
                var newPos = {};
                PixiGameRender.RenderHelper.CalculateTileCoordinates(newPos, moveEvent.NewPosition.RowIndex, moveEvent.NewPosition.CellIndex);
                this.animationsManager.AddAnimation(new PixiExtensions.AnimationMove(tileToMove, 150, newPos, function () {
                    _this.removeTileGraphics(tileToMove);
                    if (!moveEvent.ShouldBeDeleted) {
                        var newTile = _this.addTileGraphics(moveEvent.NewPosition.RowIndex, moveEvent.NewPosition.CellIndex, moveEvent.Value);
                        _this.registerTile(newTile);
                    }
                    else {
                        _this.removeTileGraphics(tileToMove);
                    }
                }));
            }
            else if (event instanceof TileMergeEvent) {
                var mergeEvent = event;
                var tileToMove = this.tiles.Get(this.getTileKey(mergeEvent.Position));
                this.unregisterTile(tileToMove);
                this.bringToFront(tileToMove);
                var newPos = {};
                PixiGameRender.RenderHelper.CalculateTileCoordinates(newPos, mergeEvent.TilePosToMergeWith.RowIndex, mergeEvent.TilePosToMergeWith.CellIndex);
                this.animationsManager.AddAnimation(new PixiExtensions.AnimationMove(tileToMove, 150, newPos, function () {
                    _this.removeTileGraphics(tileToMove);
                    var newTile = _this.addTileGraphics(mergeEvent.TilePosToMergeWith.RowIndex, mergeEvent.TilePosToMergeWith.CellIndex, mergeEvent.NewValue);
                    _this.registerTile(newTile);
                    _this.animationsManager.AddAnimation(new PixiExtensions.AnimationQueue([
                        new PixiExtensions.AnimationScale(newTile, 50, 1.3),
                        new PixiExtensions.AnimationScale(newTile, 100, 1),
                    ]));
                }));
            }
            else if (event instanceof TileCreatedEvent) {
                var createdEvent = event;
                var newTile = this.addTileGraphics(createdEvent.Position.RowIndex, createdEvent.Position.CellIndex, createdEvent.TileValue);
                this.registerTile(newTile);
                newTile.alpha = 0;
                newTile.scale = new PIXI.Point(0.1, 0.1);
                this.animationsManager.AddAnimation(new PixiExtensions.AnimationQueue([
                    new PixiExtensions.AnimationDelay(200),
                    new PixiExtensions.AnimationFade(newTile, 1, 1),
                    new PixiExtensions.AnimationScale(newTile, 150, 1)
                ]));
            }
        };
        Render.prototype.onAnimationsCompleted = function () {
            console.log('Animations completed!!');
            //this.rebuildDynamicObjects();
            this.OnTurnAnimationsCompleted.NotifyObservers(null);
        };
        Render.prototype.rebuildStaticObjects = function () {
            if (this.staticRoot != null) {
                this.stage.removeChild(this.staticRoot);
            }
            this.staticRoot = new PIXI.Container();
            this.stage.addChild(this.staticRoot);
            var otherStatic = PixiGameRender.RenderHelper.CreateOtherStatic(this.game);
            this.staticRoot.addChild(otherStatic);
            this.scoresText = PixiGameRender.RenderHelper.CreateScoresText();
            this.staticRoot.addChild(this.scoresText);
            var style = {
                font: 'Inconsolata, Courier New',
                fill: '#005521',
                lineHeight: 14
            };
            this.fpsText = new PIXI.Text("", style);
            this.fpsText.x = 300;
            this.fpsText.y = 8;
            this.staticRoot.addChild(this.fpsText);
        };
        Render.prototype.rebuildDynamicObjects = function () {
            var _this = this;
            // Update scores
            this.scoresText.text = this.game.Scores.toString();
            // Remove existing tiles
            this.tiles.Values().forEach(function (element) {
                _this.stage.removeChild(element);
            });
            this.stage.children.forEach(function (item) {
                if (item instanceof PixiGameRender.TileSprite) {
                    console.log('Found not deleted ' + item.TileKey);
                }
            });
            this.tiles = new Dictionary([]);
            // Add tiles from game grid
            for (var irow = 0; irow < this.game.Grid.Size; ++irow) {
                for (var icell = 0; icell < this.game.Grid.Size; ++icell) {
                    var tileValue = this.game.Grid.Cells[irow][icell];
                    if (tileValue != 0) {
                        var tile = this.addTileGraphics(irow, icell, tileValue);
                        this.registerTile(tile);
                    }
                }
            }
        };
        Render.prototype.registerTile = function (tile) {
            this.tiles.Add(tile.TileKey, tile);
        };
        Render.prototype.unregisterTile = function (tile) {
            var key = tile.TileKey;
            this.tiles.Remove(key);
            console.log('unregistered ' + key);
        };
        Render.prototype.removeTileGraphics = function (tile) {
            if (!tile.parent) {
                console.log('tile parent is null');
                return;
            }
            tile.parent.removeChild(tile);
        };
        Render.prototype.addTileGraphics = function (irow, icell, tileValue) {
            var tileKey = this.getTileKey({ RowIndex: irow, CellIndex: icell });
            var tileGraphics = PixiGameRender.RenderHelper.CreateTileSprite(irow, icell, tileValue, tileKey);
            PixiGameRender.RenderHelper.CalculateTileCoordinates(tileGraphics, irow, icell);
            this.stage.addChild(tileGraphics);
            return tileGraphics;
        };
        Render.prototype.bringToFront = function (tile) {
            if (tile) {
                var p = tile.parent;
                if (p) {
                    p.removeChild(tile);
                    p.addChild(tile);
                }
            }
        };
        Render.prototype.getTileKey = function (pos) {
            return pos.RowIndex.toString() + "_" + pos.CellIndex.toString();
        };
        return Render;
    }());
    PixiGameRender.Render = Render;
})(PixiGameRender || (PixiGameRender = {}));
///<reference path="game2048.ts"/>
///<reference path="render/pixi-game-render.ts"/>
function InitGame() {
    var game = new Game2048(4, new DefaultRandom());
    var render = new PixiGameRender.Render(document, game);
    game.BindRender(render);
    Mousetrap.bind('up', function () {
        game.Action(Direction.Up);
    });
    Mousetrap.bind('down', function () {
        game.Action(Direction.Down);
    });
    Mousetrap.bind('left', function () {
        game.Action(Direction.Left);
    });
    Mousetrap.bind('right', function () {
        game.Action(Direction.Right);
    });
    document.getElementById('control-up').addEventListener("click", function () {
        game.Action(Direction.Up);
    });
    document.getElementById('control-down').addEventListener("click", function () {
        game.Action(Direction.Down);
    });
    document.getElementById('control-left').addEventListener("click", function () {
        game.Action(Direction.Left);
    });
    document.getElementById('control-right').addEventListener("click", function () {
        game.Action(Direction.Right);
    });
    document.getElementById('btn-save').addEventListener("click", function () {
        var gamestate = game.Serialize();
        var file = new File([gamestate], "game2048.txt", { type: 'plain/text' });
        location.href = URL.createObjectURL(file);
    });
    document.getElementById('input-load').addEventListener("change", function (evt) {
        var files = evt.target.files; // FileList object
        for (var i = 0, f; f = files[i]; i++) {
            var reader = new FileReader();
            // Closure to capture the file information.
            reader.onload = (function (theFile) {
                return function (e) {
                    var gameState = e.target.result;
                    game.InitFromState(gameState);
                    render.RebuildGraphics();
                    document.body.focus();
                };
            })(f);
            // Read in the image file as a data URL.
            reader.readAsText(f);
        }
    }, false);
}
InitGame();
var CommonTools = (function () {
    function CommonTools() {
    }
    CommonTools.ConsoleLog = function (message, data, isBold, color) {
        if (isBold === void 0) { isBold = false; }
        if (color === void 0) { color = null; }
        var style = '';
        if (isBold) {
            style += 'font-weight:bold; ';
        }
        if (color != null) {
            style += 'color:' + color + '; ';
        }
        if (style != '') {
            console.log('%c' + message, style, data);
        }
        else {
            console.log(message, data);
        }
    };
    return CommonTools;
}());
///<reference path="pixi-animation.ts"/>
var PixiExtensions;
(function (PixiExtensions) {
    var AnimationDelay = (function () {
        function AnimationDelay(durationInMs, onCompleted) {
            if (onCompleted === void 0) { onCompleted = null; }
            this.durationRemains = durationInMs;
            this.IsCompleted = false;
            this.OnCompleted = onCompleted;
        }
        AnimationDelay.prototype.Update = function (elapsedMs) {
            if (this.durationRemains > elapsedMs) {
                this.durationRemains -= elapsedMs;
            }
            else {
                // Here is final call
                this.IsCompleted = true;
                this.durationRemains = 0;
            }
        };
        return AnimationDelay;
    }());
    PixiExtensions.AnimationDelay = AnimationDelay;
})(PixiExtensions || (PixiExtensions = {}));
///<reference path="pixi-animation.ts"/>
var PixiExtensions;
(function (PixiExtensions) {
    var AnimationFade = (function (_super) {
        __extends(AnimationFade, _super);
        function AnimationFade(entity, durationInMs, newOpacity, onCompleted) {
            if (onCompleted === void 0) { onCompleted = null; }
            _super.call(this, entity, durationInMs, onCompleted);
            this.TargetOpacity = newOpacity;
        }
        AnimationFade.prototype.Update = function (elapsedMs) {
            if (this.durationRemains > elapsedMs) {
                var d = (elapsedMs * (this.TargetOpacity - this.Entity.alpha)) / this.durationRemains;
                this.Entity.alpha += d;
                this.durationRemains -= elapsedMs;
            }
            else {
                // Here is final call
                this.Entity.alpha = this.TargetOpacity;
                this.IsCompleted = true;
                this.durationRemains = 0;
            }
        };
        return AnimationFade;
    }(PixiExtensions.AnimationBase));
    PixiExtensions.AnimationFade = AnimationFade;
})(PixiExtensions || (PixiExtensions = {}));
///<reference path="pixi-animation.ts"/>
var PixiExtensions;
(function (PixiExtensions) {
    var AnimationRotate = (function (_super) {
        __extends(AnimationRotate, _super);
        function AnimationRotate(entity, durationInMs, addRotation, onCompleted) {
            if (onCompleted === void 0) { onCompleted = null; }
            _super.call(this, entity, durationInMs, onCompleted);
            this.TargetRotation = entity.rotation + addRotation;
        }
        AnimationRotate.prototype.Update = function (elapsedMs) {
            if (this.durationRemains > elapsedMs) {
                var d = (elapsedMs * (this.TargetRotation - this.Entity.rotation)) / this.durationRemains;
                this.Entity.rotation += d;
                this.durationRemains -= elapsedMs;
            }
            else {
                // Here is final call
                this.Entity.rotation = this.TargetRotation;
                this.IsCompleted = true;
                this.durationRemains = 0;
            }
        };
        return AnimationRotate;
    }(PixiExtensions.AnimationBase));
    PixiExtensions.AnimationRotate = AnimationRotate;
})(PixiExtensions || (PixiExtensions = {}));
///<reference path="pixi-animation.ts"/>
var PixiExtensions;
(function (PixiExtensions) {
    var AnimationScale = (function (_super) {
        __extends(AnimationScale, _super);
        function AnimationScale(entity, durationInMs, newScale, onCompleted) {
            if (onCompleted === void 0) { onCompleted = null; }
            _super.call(this, entity, durationInMs, onCompleted);
            this.TargetScale = newScale;
        }
        AnimationScale.prototype.Update = function (elapsedMs) {
            if (this.durationRemains > elapsedMs) {
                var d = (elapsedMs * (this.TargetScale - this.Entity.scale.x)) / this.durationRemains;
                this.Entity.scale.x += d;
                this.Entity.scale.y += d;
                this.durationRemains -= elapsedMs;
            }
            else {
                // Here is final call
                this.Entity.scale.x = this.TargetScale;
                this.Entity.scale.y = this.TargetScale;
                this.IsCompleted = true;
                this.durationRemains = 0;
            }
        };
        return AnimationScale;
    }(PixiExtensions.AnimationBase));
    PixiExtensions.AnimationScale = AnimationScale;
})(PixiExtensions || (PixiExtensions = {}));

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImhlbHBlcnMvb2JzZXJ2YWJsZS50cyIsImhlbHBlcnMvcmFuZG9tLnRzIiwiZW51bXMudHMiLCJkdG9zLnRzIiwiZ3JpZC50cyIsInJvdy1wcm9jZXNzb3IudHMiLCJnYW1lMjA0OC50cyIsImhlbHBlcnMvZGljdGlvbmFyeS50cyIsInJlbmRlci9waXhpLWFuaW1hdGlvbi50cyIsInJlbmRlci9waXhpLWFuaW1hdGlvbi1jb21iaW5lZC50cyIsInJlbmRlci9waXhpLWFuaW1hdGlvbi1tYW5hZ2VyLnRzIiwicmVuZGVyL3BpeGktYW5pbWF0aW9uLW1vdmUudHMiLCJyZW5kZXIvcGl4aS1nYW1lLXJlbmRlci1oZWxwZXIudHMiLCJyZW5kZXIvcGl4aS1nYW1lLXJlbmRlci50cyIsImFwcC50cyIsImhlbHBlcnMvY29tbW9uLXRvb2xzLnRzIiwicmVuZGVyL3BpeGktYW5pbWF0aW9uLWRlbGF5LnRzIiwicmVuZGVyL3BpeGktYW5pbWF0aW9uLWZhZGUudHMiLCJyZW5kZXIvcGl4aS1hbmltYXRpb24tcm90YXRlLnRzIiwicmVuZGVyL3BpeGktYW5pbWF0aW9uLXNjYWxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQ0E7SUFHSTtRQUZRLGNBQVMsR0FBK0IsRUFBRSxDQUFDO0lBR25ELENBQUM7SUFFRCxxQ0FBZ0IsR0FBaEIsVUFBaUIsUUFBZ0M7UUFDN0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUVELG1DQUFjLEdBQWQsVUFBZSxRQUFnQztRQUMzQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBRUQsb0NBQWUsR0FBZixVQUFnQixHQUFNO1FBQ2xCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQUEsUUFBUTtZQUMzQixR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cyBPYnNlcnZhYmxlPFQ+IHsgLy8gb3IgSW50ZXJmYWNlXHJcbiAgICBwcml2YXRlIG9ic2VydmVyczogKChldmVudEFyZ3M6IFQpID0+IHZvaWQpW10gPSBbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIH1cclxuXHJcbiAgICBSZWdpc3Rlck9ic2VydmVyKG9ic2VydmVyOiAoZXZlbnRBcmdzOiBUKSA9PiB2b2lkKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5vYnNlcnZlcnMucHVzaChvYnNlcnZlcik7XHJcbiAgICB9XHJcblxyXG4gICAgUmVtb3ZlT2JzZXJ2ZXIob2JzZXJ2ZXI6IChldmVudEFyZ3M6IFQpID0+IHZvaWQpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm9ic2VydmVycy5zcGxpY2UodGhpcy5vYnNlcnZlcnMuaW5kZXhPZihvYnNlcnZlciksIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIE5vdGlmeU9ic2VydmVycyhhcmc6IFQpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm9ic2VydmVycy5mb3JFYWNoKG9ic2VydmVyID0+IHtcclxuICAgICAgICAgICAgb2JzZXJ2ZXIoYXJnKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSIsIi8vIEhlbHBlciBzdGF0aWMgY2xhc3MgZm9yIHdvcmtpbmcgd2l0aCByYW5kb21cclxuY2xhc3MgUmFuZG9tSGVscGVyIHtcclxuICAgIC8vIFJldHVybnMgYSByYW5kb20gaW50ZWdlciBiZXR3ZWVuIG1pbiAoaW5jbHVkZWQpIGFuZCBtYXggKGluY2x1ZGVkKVxyXG4gICAgLy8gVXNpbmcgTWF0aC5yb3VuZCgpIHdpbGwgZ2l2ZSB5b3UgYSBub24tdW5pZm9ybSBkaXN0cmlidXRpb24hXHJcbiAgICBzdGF0aWMgR2V0UmFuZG9tSW50SW5jbHVzaXZlKG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW47XHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIFJldHVybnMgYSByYW5kb20gaW50ZWdlciBiZXR3ZWVuIG1pbiAoaW5jbHVkZWQpIGFuZCBtYXggKGV4Y2x1ZGVkKVxyXG4gICAgLy8gVXNpbmcgTWF0aC5yb3VuZCgpIHdpbGwgZ2l2ZSB5b3UgYSBub24tdW5pZm9ybSBkaXN0cmlidXRpb24hXHJcbiAgICBzdGF0aWMgR2V0UmFuZG9tSW50KG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pKSArIG1pbjtcclxuICAgIH1cclxuXHJcblxyXG4gICAgc3RhdGljIEdldFJhbmRDb2xvcigpOiBudW1iZXIge1xyXG4gICAgICAgIHZhciByID0gdGhpcy5HZXRSYW5kb21JbnQoMTIwLCAyNTUpO1xyXG4gICAgICAgIHZhciBnID0gdGhpcy5HZXRSYW5kb21JbnQoMTIwLCAyNTUpO1xyXG4gICAgICAgIHZhciBiID0gdGhpcy5HZXRSYW5kb21JbnQoMTIwLCAyNTUpO1xyXG4gICAgICAgIHJldHVybiBiICsgMjU2ICogZyArIDI1NiAqIDI1NiAqIHI7XHJcbiAgICB9XHJcbn1cclxuXHJcbmludGVyZmFjZSBJUmFuZG9tIHtcclxuICAgIEdldFJhbmRvbU51bWJlcihtYXg6IG51bWJlcik6IG51bWJlcjtcclxufVxyXG5cclxuY2xhc3MgRGVmYXVsdFJhbmRvbSBpbXBsZW1lbnRzIElSYW5kb20ge1xyXG4gICAgR2V0UmFuZG9tTnVtYmVyKG1heDogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gUmFuZG9tSGVscGVyLkdldFJhbmRvbUludCgwLCBtYXgpO1xyXG4gICAgfVxyXG59IiwiXHJcbmVudW0gRGlyZWN0aW9uIHtcclxuICAgIFVwLFxyXG4gICAgRG93bixcclxuICAgIFJpZ2h0LFxyXG4gICAgTGVmdFxyXG59XHJcbiIsIlxyXG5jbGFzcyBUaWxlUG9zaXRpb24ge1xyXG4gICAgUm93SW5kZXg6IG51bWJlcjtcclxuICAgIENlbGxJbmRleDogbnVtYmVyO1xyXG4gICAgY29uc3RydWN0b3Iocm93OiBudW1iZXIsIGNlbGw6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuUm93SW5kZXggPSByb3c7XHJcbiAgICAgICAgdGhpcy5DZWxsSW5kZXggPSBjZWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHRvU3RyaW5nKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIGBbJHt0aGlzLlJvd0luZGV4fSwke3RoaXMuQ2VsbEluZGV4fV1gO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBUaWxlIGV4dGVuZHMgVGlsZVBvc2l0aW9uIHtcclxuICAgIFZhbHVlOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3Iocm93OiBudW1iZXIsIGNlbGw6IG51bWJlciwgdmFsdWU6IG51bWJlcikge1xyXG4gICAgICAgIHN1cGVyKHJvdywgY2VsbCk7XHJcbiAgICAgICAgdGhpcy5WYWx1ZSA9IHZhbHVlO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBSb3dQcm9jZXNzaW9uRXZlbnQge1xyXG4gICAgT2xkSW5kZXg6IG51bWJlcjtcclxuICAgIE5ld0luZGV4OiBudW1iZXI7XHJcbiAgICBWYWx1ZTogbnVtYmVyO1xyXG4gICAgTWVyZ2VkVmFsdWU6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihvbGRJbmRleDogbnVtYmVyLCBuZXdJbmRleDogbnVtYmVyLCB2YWx1ZTogbnVtYmVyLCBtZXJnZWRWYWx1ZTogbnVtYmVyID0gMCkge1xyXG4gICAgICAgIHRoaXMuT2xkSW5kZXggPSBvbGRJbmRleDtcclxuICAgICAgICB0aGlzLk5ld0luZGV4ID0gbmV3SW5kZXg7XHJcbiAgICAgICAgdGhpcy5NZXJnZWRWYWx1ZSA9IG1lcmdlZFZhbHVlO1xyXG4gICAgICAgIHRoaXMuVmFsdWUgPSB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBJc0RlbGV0ZWQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLk1lcmdlZFZhbHVlIDwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgSXNNZXJnZWQoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLk1lcmdlZFZhbHVlID4gMCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFRpbGVVcGRhdGVFdmVudCB7XHJcbiAgICBQb3NpdGlvbjogVGlsZVBvc2l0aW9uO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHBvc2l0aW9uOiBUaWxlUG9zaXRpb24pIHtcclxuICAgICAgICB0aGlzLlBvc2l0aW9uID0gcG9zaXRpb247XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFRpbGVNZXJnZUV2ZW50IGV4dGVuZHMgVGlsZVVwZGF0ZUV2ZW50IHtcclxuICAgIFRpbGVQb3NUb01lcmdlV2l0aDogVGlsZVBvc2l0aW9uO1xyXG4gICAgTmV3VmFsdWU6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihvbGRQb3NpdGlvbjogVGlsZVBvc2l0aW9uLCBtZXJnZVBvc2l0aW9uOiBUaWxlUG9zaXRpb24sIG5ld1ZhbHVlOiBudW1iZXIpIHtcclxuICAgICAgICBzdXBlcihvbGRQb3NpdGlvbik7XHJcbiAgICAgICAgdGhpcy5UaWxlUG9zVG9NZXJnZVdpdGggPSBtZXJnZVBvc2l0aW9uO1xyXG4gICAgICAgIHRoaXMuTmV3VmFsdWUgPSBuZXdWYWx1ZTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgVGlsZU1vdmVFdmVudCBleHRlbmRzIFRpbGVVcGRhdGVFdmVudCB7XHJcbiAgICBOZXdQb3NpdGlvbjogVGlsZVBvc2l0aW9uO1xyXG4gICAgVmFsdWU6IG51bWJlcjtcclxuICAgIFNob3VsZEJlRGVsZXRlZDogYm9vbGVhbjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihvbGRQb3NpdGlvbjogVGlsZVBvc2l0aW9uLCBuZXdQb3NpdGlvbjogVGlsZVBvc2l0aW9uLCB2YWx1ZTogbnVtYmVyLCBzaG91bGRCZURlbGV0ZWQ6IGJvb2xlYW4pIHtcclxuICAgICAgICBzdXBlcihvbGRQb3NpdGlvbik7XHJcbiAgICAgICAgdGhpcy5OZXdQb3NpdGlvbiA9IG5ld1Bvc2l0aW9uO1xyXG4gICAgICAgIHRoaXMuVmFsdWUgPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLlNob3VsZEJlRGVsZXRlZCA9IHNob3VsZEJlRGVsZXRlZDtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgVGlsZUNyZWF0ZWRFdmVudCBleHRlbmRzIFRpbGVVcGRhdGVFdmVudCB7XHJcbiAgICBUaWxlVmFsdWU6IG51bWJlcjtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihwb3NpdGlvbjogVGlsZVBvc2l0aW9uLCB0aWxlVmFsdWU6IG51bWJlcikge1xyXG4gICAgICAgIHN1cGVyKHBvc2l0aW9uKTtcclxuICAgICAgICB0aGlzLlRpbGVWYWx1ZSA9IHRpbGVWYWx1ZTtcclxuICAgIH1cclxufVxyXG4iLCIvLy88cmVmZXJlbmNlIHBhdGg9XCJlbnVtcy50c1wiLz5cclxuLy8vPHJlZmVyZW5jZSBwYXRoPVwiZHRvcy50c1wiLz5cclxuXHJcbmNsYXNzIEdyaWQge1xyXG4gICAgU2l6ZTogbnVtYmVyO1xyXG4gICAgQ2VsbHM6IG51bWJlcltdW107XHJcblxyXG4gICAgY29uc3RydWN0b3Ioc2l6ZTogbnVtYmVyKSB7XHJcbiAgICAgICAgdGhpcy5TaXplID0gc2l6ZTtcclxuICAgICAgICB0aGlzLkNlbGxzID0gbmV3IEFycmF5KHRoaXMuU2l6ZSk7XHJcbiAgICAgICAgZm9yICh2YXIgaXJvdyA9IDA7IGlyb3cgPCB0aGlzLlNpemU7IGlyb3crKykge1xyXG4gICAgICAgICAgICB0aGlzLkNlbGxzW2lyb3ddID0gbmV3IEFycmF5KHRoaXMuU2l6ZSk7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGljZWxsID0gMDsgaWNlbGwgPCB0aGlzLlNpemU7IGljZWxsKyspIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuQ2VsbHNbaXJvd11baWNlbGxdID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBTZXJpYWxpemUoKTogc3RyaW5nIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gPHN0cmluZ1tdPltdO1xyXG4gICAgICAgIGZvciAodmFyIGlyb3cgPSAwOyBpcm93IDwgdGhpcy5TaXplOyArK2lyb3cpIHtcclxuICAgICAgICAgICAgcmVzdWx0LnB1c2godGhpcy5DZWxsc1tpcm93XS5qb2luKCcsJykpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQuam9pbignfCcpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBEZXNlcmlhbGl6ZShzdGF0ZTogc3RyaW5nKTogR3JpZCB7XHJcbiAgICAgICAgdmFyIGdyaWQgPSBuZXcgR3JpZCgxKTtcclxuICAgICAgICBncmlkLkluaXRGcm9tU3RhdGUoc3RhdGUpO1xyXG4gICAgICAgIHJldHVybiBncmlkO1xyXG4gICAgfVxyXG5cclxuICAgIHByb3RlY3RlZCBJbml0RnJvbVN0YXRlKHN0YXRlOiBzdHJpbmcpIHtcclxuICAgICAgICB2YXIgcm93c0RhdGEgPSBzdGF0ZS5zcGxpdChcInxcIik7XHJcblxyXG4gICAgICAgIHRoaXMuU2l6ZSA9IHJvd3NEYXRhLmxlbmd0aDtcclxuICAgICAgICB0aGlzLkNlbGxzID0gPG51bWJlcltdW10+W107XHJcbiAgICAgICAgZm9yICh2YXIgaXJvdyA9IDA7IGlyb3cgPCB0aGlzLlNpemU7ICsraXJvdykge1xyXG4gICAgICAgICAgICB2YXIgcm93ID0gPG51bWJlcltdPltdO1xyXG4gICAgICAgICAgICB0aGlzLkNlbGxzLnB1c2gocm93KTtcclxuICAgICAgICAgICAgdmFyIGNlbGxzRGF0YSA9IHJvd3NEYXRhW2lyb3ddLnNwbGl0KFwiLFwiKTtcclxuICAgICAgICAgICAgaWYgKGNlbGxzRGF0YS5sZW5ndGggIT0gdGhpcy5TaXplKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyAnSW5jb3JyZWN0IHNlcmlhbGl6ZWQgZ3JpZCBzdGF0ZSc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZm9yICh2YXIgaWNlbGwgPSAwOyBpY2VsbCA8IHRoaXMuU2l6ZTsgKytpY2VsbCkge1xyXG4gICAgICAgICAgICAgICAgcm93LnB1c2gocGFyc2VJbnQoY2VsbHNEYXRhW2ljZWxsXSwgMTApKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBJbnNlcnRUaWxlQnlQb3MocG9zOiBUaWxlUG9zaXRpb24sIHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLkluc2VydFRpbGUocG9zLlJvd0luZGV4LCBwb3MuQ2VsbEluZGV4LCB2YWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgSW5zZXJ0VGlsZShpcm93OiBudW1iZXIsIGljZWxsOiBudW1iZXIsIHZhbHVlOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICBpZiAoaXJvdyA8IDApIHtcclxuICAgICAgICAgICAgdGhyb3cgXCJYIHBvc2l0aW9uIFwiICsgaXJvdyArIFwiaXMgPCAwXCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaWNlbGwgPCAwKSB7XHJcbiAgICAgICAgICAgIHRocm93IFwiWSBwb3NpdGlvbiBcIiArIGljZWxsICsgXCJpcyA8IDBcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpcm93ID49IHRoaXMuU2l6ZSkge1xyXG4gICAgICAgICAgICB0aHJvdyBcIlggcG9zaXRpb24gXCIgKyBpcm93ICsgXCJpcyBtb3JlIHRoYW4gZ3JpZCBzaXplXCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaWNlbGwgPj0gdGhpcy5TaXplKSB7XHJcbiAgICAgICAgICAgIHRocm93IFwiWSBwb3NpdGlvbiBcIiArIGljZWxsICsgXCJpcyBtb3JlIHRoYW4gZ3JpZCBzaXplXCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5DZWxsc1tpcm93XVtpY2VsbF0gIT0gMCkge1xyXG4gICAgICAgICAgICB0aHJvdyBcIkNlbGwgd2l0aCBwb3NpdGlvbiBcIiArIGlyb3cgKyBcIiwgXCIgKyBpY2VsbCArIFwiIGlzIG9jY3VwaWVkXCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLkNlbGxzW2lyb3ddW2ljZWxsXSA9IHZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIFJlbW92ZVRpbGUoaXJvdzogbnVtYmVyLCBpY2VsbDogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5DZWxsc1tpcm93XVtpY2VsbF0gPSAwO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBSZW1vdmVUaWxlQnlQb3MocG9zOiBUaWxlUG9zaXRpb24pOnZvaWR7XHJcbiAgICAgICAgdGhpcy5SZW1vdmVUaWxlKHBvcy5Sb3dJbmRleCwgcG9zLkNlbGxJbmRleCk7XHJcbiAgICB9XHJcblxyXG4gICAgR2V0VGlsZShpcm93OiBudW1iZXIsIGljZWxsOiBudW1iZXIpOiBUaWxlIHtcclxuICAgICAgICByZXR1cm4gbmV3IFRpbGUoaXJvdywgaWNlbGwsIHRoaXMuQ2VsbHNbaXJvd11baWNlbGxdKTtcclxuICAgIH1cclxuXHJcbiAgICBVcGRhdGVUaWxlQnlQb3MocG9zOiBUaWxlUG9zaXRpb24sIG5ld1ZhbHVlOiBudW1iZXIpe1xyXG4gICAgICAgIHRoaXMuQ2VsbHNbcG9zLlJvd0luZGV4XVtwb3MuQ2VsbEluZGV4XSA9IG5ld1ZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIEF2YWlsYWJsZUNlbGxzKCk6IFRpbGVQb3NpdGlvbltdIHtcclxuICAgICAgICB2YXIgYXZhaWxQb3NpdGlvbnM6IEFycmF5PFRpbGVQb3NpdGlvbj4gPSBbXTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaXJvdyA9IDA7IGlyb3cgPCB0aGlzLlNpemU7ICsraXJvdykge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpY2VsbCA9IDA7IGljZWxsIDwgdGhpcy5TaXplOyArK2ljZWxsKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5DZWxsc1tpcm93XVtpY2VsbF0gPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGF2YWlsUG9zaXRpb25zLnB1c2gobmV3IFRpbGVQb3NpdGlvbihpcm93LCBpY2VsbCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gYXZhaWxQb3NpdGlvbnM7XHJcbiAgICB9XHJcblxyXG4gICAgR2V0Um93RGF0YUJ5RGlyZWN0aW9uKG1vdmU6IERpcmVjdGlvbik6IFRpbGVbXVtdIHtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gPFRpbGVbXVtdPltdO1xyXG5cclxuICAgICAgICBzd2l0Y2ggKG1vdmUpIHtcclxuICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uTGVmdDpcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGlyb3cgPSAwOyBpcm93IDwgdGhpcy5TaXplOyArK2lyb3cpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgcm93ID0gPFRpbGVbXT5bXTtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpY2VsbCA9IDA7IGljZWxsIDwgdGhpcy5TaXplOyArK2ljZWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdy5wdXNoKHRoaXMuR2V0VGlsZShpcm93LCBpY2VsbCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChyb3cpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uUmlnaHQ6XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpcm93ID0gMDsgaXJvdyA8IHRoaXMuU2l6ZTsgKytpcm93KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJvdyA9IDxUaWxlW10+W107XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaWNlbGwgPSAwOyBpY2VsbCA8IHRoaXMuU2l6ZTsgKytpY2VsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByb3cucHVzaCh0aGlzLkdldFRpbGUoaXJvdywgdGhpcy5TaXplIC0gaWNlbGwgLSAxKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHJvdyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgY2FzZSBEaXJlY3Rpb24uVXA6XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpY2VsbCA9IDA7IGljZWxsIDwgdGhpcy5TaXplOyArK2ljZWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJvdyA9IDxUaWxlW10+W107XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaXJvdyA9IDA7IGlyb3cgPCB0aGlzLlNpemU7ICsraXJvdykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByb3cucHVzaCh0aGlzLkdldFRpbGUoaXJvdywgaWNlbGwpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2gocm93KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIERpcmVjdGlvbi5Eb3duOlxyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaWNlbGwgPSAwOyBpY2VsbCA8IHRoaXMuU2l6ZTsgKytpY2VsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByb3cgPSA8VGlsZVtdPltdO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGlyb3cgPSAwOyBpcm93IDwgdGhpcy5TaXplOyArK2lyb3cpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcm93LnB1c2godGhpcy5HZXRUaWxlKHRoaXMuU2l6ZSAtIGlyb3cgLSAxLCBpY2VsbCkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChyb3cpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8vPHJlZmVyZW5jZSBwYXRoPVwiZHRvcy50c1wiLz5cclxuXHJcbmNsYXNzIFJvd1Byb2Nlc3NvciB7XHJcbiAgICBzdGF0aWMgUHJvY2Vzc1Jvdyh0aWxlczogVGlsZVtdKTogUm93UHJvY2Vzc2lvbkV2ZW50W10ge1xyXG4gICAgICAgIHZhciB2YWx1ZVRvTWVyZ2UgPSB0aWxlc1swXS5WYWx1ZTtcclxuICAgICAgICB2YXIgYXZhaWxhYmxlQ2VsbEluZGV4ID0gdGlsZXNbMF0uVmFsdWUgPiAwID8gMSA6IDA7XHJcbiAgICAgICAgdmFyIHJlc3VsdEV2ZW50cyA9IDxSb3dQcm9jZXNzaW9uRXZlbnRbXT5bXTtcclxuICAgICAgICB2YXIgbW92ZUV2ZW50QmVmb3JlTWVyZ2U6IFJvd1Byb2Nlc3Npb25FdmVudCA9IG51bGw7XHJcblxyXG4gICAgICAgIGZvciAodmFyIGlyID0gMTsgaXIgPCB0aWxlcy5sZW5ndGg7ICsraXIpIHtcclxuICAgICAgICAgICAgdmFyIGN1cnJlbnQgPSB0aWxlc1tpcl0uVmFsdWU7XHJcblxyXG4gICAgICAgICAgICBpZiAoY3VycmVudCA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBTa2lwIHplcm9zXHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHZhbHVlVG9NZXJnZSAhPSBjdXJyZW50KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXIgPiBhdmFpbGFibGVDZWxsSW5kZXgpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBNb3ZlIGNhc2VcclxuICAgICAgICAgICAgICAgICAgICBtb3ZlRXZlbnRCZWZvcmVNZXJnZSA9IG5ldyBSb3dQcm9jZXNzaW9uRXZlbnQoaXIsIGF2YWlsYWJsZUNlbGxJbmRleCwgY3VycmVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0RXZlbnRzLnB1c2gobW92ZUV2ZW50QmVmb3JlTWVyZ2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFsdWVUb01lcmdlID0gY3VycmVudDtcclxuICAgICAgICAgICAgICAgICsrYXZhaWxhYmxlQ2VsbEluZGV4O1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIE1lcmdlIGNhc2UgKGFjY3VtdWxhdGVkVmFsdWUgIT0gY3VycmVudClcclxuICAgICAgICAgICAgLy8gSWYgd2UgZG8gbWVyZ2UgYWZ0ZXIgbW92ZSB0aGVuXHJcbiAgICAgICAgICAgIGlmIChtb3ZlRXZlbnRCZWZvcmVNZXJnZSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBtb3ZlRXZlbnRCZWZvcmVNZXJnZS5NZXJnZWRWYWx1ZSA9IC0xO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gRmFrZSBtb3ZlIGV2ZW50IGp1c3QgZm9yIGRlbGV0aW9uIFxyXG4gICAgICAgICAgICAgICAgcmVzdWx0RXZlbnRzLnB1c2gobmV3IFJvd1Byb2Nlc3Npb25FdmVudChhdmFpbGFibGVDZWxsSW5kZXggLSAxLCBhdmFpbGFibGVDZWxsSW5kZXggLSAxLCBjdXJyZW50LCAtMSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlc3VsdEV2ZW50cy5wdXNoKG5ldyBSb3dQcm9jZXNzaW9uRXZlbnQoaXIsIGF2YWlsYWJsZUNlbGxJbmRleCAtIDEsIGN1cnJlbnQsIGN1cnJlbnQgKyB2YWx1ZVRvTWVyZ2UpKTtcclxuXHJcbiAgICAgICAgICAgIHZhbHVlVG9NZXJnZSA9IDA7ICAvLyBEb24ndCBhbGxvdyBhbGwgbWVyZ2VzIGluIG9uZSB0dXJuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcmVzdWx0RXZlbnRzO1xyXG4gICAgfVxyXG59IiwiLy8vPHJlZmVyZW5jZSBwYXRoPVwiaGVscGVycy9vYnNlcnZhYmxlLnRzXCIvPlxyXG4vLy88cmVmZXJlbmNlIHBhdGg9XCJoZWxwZXJzL3JhbmRvbS50c1wiLz5cclxuLy8vPHJlZmVyZW5jZSBwYXRoPVwiZ3JpZC50c1wiLz5cclxuLy8vPHJlZmVyZW5jZSBwYXRoPVwicm93LXByb2Nlc3Nvci50c1wiLz5cclxuXHJcbmludGVyZmFjZSBJR2FtZTIwNDhSZW5kZXIge1xyXG4gICAgT25HYW1lRmluaXNoZWQoKTogdm9pZDtcclxuICAgIE9uVGlsZXNVcGRhdGVkKGV2ZW50OiBUaWxlVXBkYXRlRXZlbnQpOiB2b2lkO1xyXG4gICAgT25UdXJuQW5pbWF0aW9uc0NvbXBsZXRlZDogT2JzZXJ2YWJsZTx2b2lkPjtcclxufVxyXG5cclxuaW50ZXJmYWNlIElHYW1lU3RhdGUge1xyXG4gICAgU2NvcmVzOiBudW1iZXIsXHJcbiAgICBHcmlkU2VyaWFsaXplZDogc3RyaW5nXHJcbn1cclxuXHJcbmNsYXNzIEdhbWUyMDQ4IHtcclxuICAgIFNjb3JlczogbnVtYmVyID0gMDtcclxuICAgIEdyaWQ6IEdyaWQ7XHJcbiAgICBPblRpbGVzVXBkYXRlZDogT2JzZXJ2YWJsZTxUaWxlVXBkYXRlRXZlbnQ+ID0gbmV3IE9ic2VydmFibGU8VGlsZVVwZGF0ZUV2ZW50PigpO1xyXG4gICAgT25HYW1lRmluaXNoZWQ6IE9ic2VydmFibGU8dm9pZD4gPSBuZXcgT2JzZXJ2YWJsZTx2b2lkPigpO1xyXG4gICAgcHJpdmF0ZSB1c2VyQWN0aW9uc1F1ZXVlOiAoKCkgPT4gdm9pZClbXSA9IFtdO1xyXG4gICAgcHJpdmF0ZSByYW5kOiBJUmFuZG9tO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHNpemU6IG51bWJlciwgcmFuZDogSVJhbmRvbSkge1xyXG4gICAgICAgIHRoaXMucmFuZCA9IHJhbmQ7XHJcbiAgICAgICAgdGhpcy5HcmlkID0gbmV3IEdyaWQoc2l6ZSk7XHJcbiAgICAgICAgdGhpcy5pbnNlcnROZXdUaWxlVG9WYWNhbnRTcGFjZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIEJpbmRSZW5kZXIocmVuZGVyOiBJR2FtZTIwNDhSZW5kZXIpOiB2b2lkIHtcclxuICAgICAgICB0aGlzLk9uVGlsZXNVcGRhdGVkLlJlZ2lzdGVyT2JzZXJ2ZXIocmVuZGVyLk9uVGlsZXNVcGRhdGVkLmJpbmQocmVuZGVyKSk7XHJcbiAgICAgICAgdGhpcy5PbkdhbWVGaW5pc2hlZC5SZWdpc3Rlck9ic2VydmVyKHJlbmRlci5PbkdhbWVGaW5pc2hlZC5iaW5kKHJlbmRlcikpO1xyXG5cclxuICAgICAgICByZW5kZXIuT25UdXJuQW5pbWF0aW9uc0NvbXBsZXRlZC5SZWdpc3Rlck9ic2VydmVyKHRoaXMuZmV0Y2hBbmRFeGVjdXRlVXNlckFjdGlvbkZyb21RdWV1ZS5iaW5kKHRoaXMpKTtcclxuICAgIH1cclxuXHJcbiAgICBTZXJpYWxpemUoKTogc3RyaW5nIHtcclxuICAgICAgICB2YXIgc3RhdGUgPSA8SUdhbWVTdGF0ZT57XHJcbiAgICAgICAgICAgIFNjb3JlczogdGhpcy5TY29yZXMsXHJcbiAgICAgICAgICAgIEdyaWRTZXJpYWxpemVkOiB0aGlzLkdyaWQuU2VyaWFsaXplKClcclxuICAgICAgICB9O1xyXG4gICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShzdGF0ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIEluaXRGcm9tU3RhdGUoZ2FtZVN0YXRlOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICB2YXIgc3RhdGUgPSA8SUdhbWVTdGF0ZT5KU09OLnBhcnNlKGdhbWVTdGF0ZSk7XHJcbiAgICAgICAgdGhpcy5TY29yZXMgPSBzdGF0ZS5TY29yZXM7XHJcbiAgICAgICAgdGhpcy5HcmlkID0gR3JpZC5EZXNlcmlhbGl6ZShzdGF0ZS5HcmlkU2VyaWFsaXplZCk7XHJcbiAgICB9XHJcblxyXG4gICAgQWN0aW9uKG1vdmU6IERpcmVjdGlvbik6IHZvaWQge1xyXG4gICAgICAgIHZhciBhY3Rpb24gPSB0aGlzLnByb2Nlc3NBY3Rpb24uYmluZCh0aGlzLCBtb3ZlKTtcclxuICAgICAgICB0aGlzLnVzZXJBY3Rpb25zUXVldWUucHVzaChhY3Rpb24pO1xyXG4gICAgICAgIGlmICh0aGlzLnVzZXJBY3Rpb25zUXVldWUubGVuZ3RoID09IDEpIHtcclxuICAgICAgICAgICAgYWN0aW9uKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZmV0Y2hBbmRFeGVjdXRlVXNlckFjdGlvbkZyb21RdWV1ZSgpIHtcclxuICAgICAgICB0aGlzLnVzZXJBY3Rpb25zUXVldWUuc3BsaWNlKDAsIDEpO1xyXG4gICAgICAgIGlmICh0aGlzLnVzZXJBY3Rpb25zUXVldWUubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICB2YXIgYWN0aW9uID0gdGhpcy51c2VyQWN0aW9uc1F1ZXVlWzBdO1xyXG4gICAgICAgICAgICBhY3Rpb24oKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBjYWxjdWxhdGVHYW1lRXZlbnRzKG1vdmU6IERpcmVjdGlvbik6IFRpbGVVcGRhdGVFdmVudFtdIHtcclxuICAgICAgICB2YXIgYWxsRXZlbnRzID0gW107XHJcbiAgICAgICAgdmFyIHJvd3NEYXRhID0gdGhpcy5HcmlkLkdldFJvd0RhdGFCeURpcmVjdGlvbihtb3ZlKTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByb3dzRGF0YS5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgcm93RXZlbnRzID0gUm93UHJvY2Vzc29yLlByb2Nlc3NSb3cocm93c0RhdGFbaV0pO1xyXG5cclxuICAgICAgICAgICAgLy9hcHBseSByb3cgZXZlbnRzIHRvIGdhbWUgZ3JpZCBhbmQgcHVibGlzaCB0aGVtIHRvIHN1YnNjcmliZXJzXHJcbiAgICAgICAgICAgIGZvciAodmFyIGllID0gMDsgaWUgPCByb3dFdmVudHMubGVuZ3RoOyArK2llKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcm93RXZlbnQgPSByb3dFdmVudHNbaWVdO1xyXG4gICAgICAgICAgICAgICAgdmFyIG9sZFBvcyA9IHJvd3NEYXRhW2ldW3Jvd0V2ZW50Lk9sZEluZGV4XTtcclxuICAgICAgICAgICAgICAgIHZhciBuZXdQb3MgPSByb3dzRGF0YVtpXVtyb3dFdmVudC5OZXdJbmRleF07XHJcbiAgICAgICAgICAgICAgICBpZiAocm93RXZlbnQuSXNNZXJnZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFsbEV2ZW50cy5wdXNoKG5ldyBUaWxlTWVyZ2VFdmVudChvbGRQb3MsIG5ld1Bvcywgcm93RXZlbnQuTWVyZ2VkVmFsdWUpKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWxsRXZlbnRzLnB1c2gobmV3IFRpbGVNb3ZlRXZlbnQob2xkUG9zLCBuZXdQb3MsIHJvd0V2ZW50LlZhbHVlLCByb3dFdmVudC5Jc0RlbGV0ZWQoKSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gYWxsRXZlbnRzO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgcHJvY2Vzc0FjdGlvbihtb3ZlOiBEaXJlY3Rpb24pIHtcclxuICAgICAgICBDb21tb25Ub29scy5Db25zb2xlTG9nKFwic3RhcnQgcHJvY2VzcyBhY3Rpb25cIiwgW3RoaXMuR3JpZC5TZXJpYWxpemUoKSwgRGlyZWN0aW9uW21vdmVdXSk7XHJcblxyXG4gICAgICAgIHZhciBnYW1lRXZlbnRzID0gdGhpcy5jYWxjdWxhdGVHYW1lRXZlbnRzKG1vdmUpO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdhbWVFdmVudHMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgdmFyIGV2ZW50ID0gZ2FtZUV2ZW50c1tpXTtcclxuXHJcbiAgICAgICAgICAgIGlmIChldmVudCBpbnN0YW5jZW9mIFRpbGVNb3ZlRXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIHZhciBtb3ZlRXZlbnQgPSA8VGlsZU1vdmVFdmVudD5ldmVudDtcclxuICAgICAgICAgICAgICAgIHRoaXMuR3JpZC5VcGRhdGVUaWxlQnlQb3MobW92ZUV2ZW50Lk5ld1Bvc2l0aW9uLCBtb3ZlRXZlbnQuVmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5HcmlkLlJlbW92ZVRpbGVCeVBvcyhtb3ZlRXZlbnQuUG9zaXRpb24pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoZXZlbnQgaW5zdGFuY2VvZiBUaWxlTWVyZ2VFdmVudCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG1lcmdlRXZlbnQgPSA8VGlsZU1lcmdlRXZlbnQ+ZXZlbnQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLkdyaWQuVXBkYXRlVGlsZUJ5UG9zKG1lcmdlRXZlbnQuVGlsZVBvc1RvTWVyZ2VXaXRoLCBtZXJnZUV2ZW50Lk5ld1ZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuR3JpZC5SZW1vdmVUaWxlQnlQb3MobWVyZ2VFdmVudC5Qb3NpdGlvbik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLlNjb3JlcyArPSBtZXJnZUV2ZW50Lk5ld1ZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLk9uVGlsZXNVcGRhdGVkLk5vdGlmeU9ic2VydmVycyhldmVudCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZ2FtZUV2ZW50cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIC8vIElmIHdlIGhhdmUgZXZlbnRzIHRoZW4gdGhlcmUgd2VyZSBzb21lIG1vdmVtZW50cyBhbmQgdGhlcmVmb3JlIHRoZXJlIG11c3QgYmUgc29tZSBlbXB0eSBzcGFjZSB0byBpbnNlcnQgbmV3IHRpbGVcclxuICAgICAgICAgICAgdmFyIG5ld1RpbGUgPSB0aGlzLmluc2VydE5ld1RpbGVUb1ZhY2FudFNwYWNlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuT25UaWxlc1VwZGF0ZWQuTm90aWZ5T2JzZXJ2ZXJzKG5ldyBUaWxlQ3JlYXRlZEV2ZW50KG5ld1RpbGUsIG5ld1RpbGUuVmFsdWUpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLk9uVGlsZXNVcGRhdGVkLk5vdGlmeU9ic2VydmVycyhudWxsKTsgIC8vIER1bW15IGV2ZW50IC0ganVzdCBpbmRpY2F0b3IgdGhhdCB1c2VyIG1hZGUgaGlzIGFjdGlvbiB3aXRob3V0IG1vdmVtZW50c1xyXG5cclxuICAgICAgICAgICAgLy8gSGVyZSB3ZSBuZWVkIHRvIGNoZWNrIGlmIGdhbWUgZ3JpZCBpcyBmdWxsIC0gc28gbWlnaHQgYmUgZ2FtZSBpcyBmaW5pc2hlZCBpZiB0aGVyZSBpcyBubyBwb3NzaWJpbGl0eSB0byBtYWtlIGEgbW92ZW1lbnRcclxuICAgICAgICAgICAgdmFyIGF2YWlsVGl0bGVzID0gdGhpcy5HcmlkLkF2YWlsYWJsZUNlbGxzKCk7XHJcbiAgICAgICAgICAgIGlmIChhdmFpbFRpdGxlcy5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhlcmUgYXJlIHBvc3NpYmxlIG1vdmVtZW50c1xyXG4gICAgICAgICAgICAgICAgdmFyIHdlSGF2ZVNvbWVQb3NzaWJsZUV2ZW50cyA9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYWxjdWxhdGVHYW1lRXZlbnRzKERpcmVjdGlvbi5VcCkubGVuZ3RoID4gMFxyXG4gICAgICAgICAgICAgICAgICAgIHx8IHRoaXMuY2FsY3VsYXRlR2FtZUV2ZW50cyhEaXJlY3Rpb24uUmlnaHQpLmxlbmd0aCA+IDBcclxuICAgICAgICAgICAgICAgICAgICB8fCB0aGlzLmNhbGN1bGF0ZUdhbWVFdmVudHMoRGlyZWN0aW9uLkxlZnQpLmxlbmd0aCA+IDBcclxuICAgICAgICAgICAgICAgICAgICB8fCB0aGlzLmNhbGN1bGF0ZUdhbWVFdmVudHMoRGlyZWN0aW9uLkRvd24pLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXdlSGF2ZVNvbWVQb3NzaWJsZUV2ZW50cykge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIEdhbWUgaXMgb3ZlciwgZHVkZVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuT25HYW1lRmluaXNoZWQuTm90aWZ5T2JzZXJ2ZXJzKG51bGwpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBDb21tb25Ub29scy5Db25zb2xlTG9nKFwiICBlbmQgcHJvY2VzcyBhY3Rpb25cIiwgW3RoaXMuR3JpZC5TZXJpYWxpemUoKV0pXHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBpbnNlcnROZXdUaWxlVG9WYWNhbnRTcGFjZSgpOiBUaWxlIHtcclxuICAgICAgICB2YXIgYXZhaWxUaXRsZXMgPSB0aGlzLkdyaWQuQXZhaWxhYmxlQ2VsbHMoKTtcclxuICAgICAgICBpZiAoYXZhaWxUaXRsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICB2YXIgdGkgPSB0aGlzLnJhbmQuR2V0UmFuZG9tTnVtYmVyKGF2YWlsVGl0bGVzLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIHZhciBwb3MgPSBhdmFpbFRpdGxlc1t0aV07XHJcbiAgICAgICAgICAgIHZhciB0aWxlID0gbmV3IFRpbGUocG9zLlJvd0luZGV4LCBwb3MuQ2VsbEluZGV4LCAyKTtcclxuICAgICAgICAgICAgdGhpcy5HcmlkLkluc2VydFRpbGVCeVBvcyh0aWxlLCB0aWxlLlZhbHVlKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRpbGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxufVxyXG4iLCJcclxuaW50ZXJmYWNlIElEaWN0aW9uYXJ5PFRLZXksIFRWYWx1ZT4ge1xyXG4gICAgQWRkKGtleTogVEtleSwgdmFsdWU6IFRWYWx1ZSk6IHZvaWQ7XHJcbiAgICBSZW1vdmUoa2V5OiBUS2V5KTogdm9pZDtcclxuICAgIENvbnRhaW5zS2V5KGtleTogVEtleSk6IGJvb2xlYW47XHJcbiAgICBLZXlzKCk6IFRLZXlbXTtcclxuICAgIFZhbHVlcygpOiBUVmFsdWVbXTtcclxufVxyXG5cclxuY2xhc3MgRGljdGlvbmFyeTxUS2V5LCBUVmFsdWU+IGltcGxlbWVudHMgSURpY3Rpb25hcnk8VEtleSwgVFZhbHVlPiB7XHJcblxyXG4gICAgcHJpdmF0ZSBfa2V5czogVEtleVtdID0gW107XHJcbiAgICBwcml2YXRlIF92YWx1ZXM6IFRWYWx1ZVtdID0gW107XHJcblxyXG4gICAgY29uc3RydWN0b3IoaW5pdDogeyBLZXk6IFRLZXk7IFZhbHVlOiBUVmFsdWU7IH1bXSkge1xyXG4gICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgaW5pdC5sZW5ndGg7IHgrKykge1xyXG4gICAgICAgICAgICB0aGlzLkFkZChpbml0W3hdLktleSwgaW5pdFt4XS5WYWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIEFkZChrZXk6IFRLZXksIHZhbHVlOiBUVmFsdWUpOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpc1trZXkudG9TdHJpbmcoKV0gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aHJvdyBgSXRlbSB3aXRoIGtleSAke2tleX0gaGFzIGJlZW4gYWxyZWFkeSBhZGRlZCB0byBkaWN0aW9uYXJ5YDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXNba2V5LnRvU3RyaW5nKCldID0gdmFsdWU7XHJcbiAgICAgICAgdGhpcy5fa2V5cy5wdXNoKGtleSk7XHJcbiAgICAgICAgdGhpcy5fdmFsdWVzLnB1c2godmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIFJlbW92ZShrZXk6IFRLZXkpOiB2b2lkIHtcclxuICAgICAgICB2YXIgaW5kZXggPSB0aGlzLl9rZXlzLmluZGV4T2Yoa2V5LCAwKTtcclxuICAgICAgICB0aGlzLl9rZXlzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgdGhpcy5fdmFsdWVzLnNwbGljZShpbmRleCwgMSk7XHJcblxyXG4gICAgICAgIGRlbGV0ZSB0aGlzW2tleS50b1N0cmluZygpXTtcclxuICAgIH1cclxuXHJcbiAgICBLZXlzKCk6IFRLZXlbXSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2tleXM7XHJcbiAgICB9XHJcblxyXG4gICAgVmFsdWVzKCk6IFRWYWx1ZVtdIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWVzO1xyXG4gICAgfVxyXG5cclxuICAgIENvbnRhaW5zS2V5KGtleTogVEtleSkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgdGhpc1trZXkudG9TdHJpbmcoKV0gPT09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgR2V0KGtleTogVEtleSk6IFRWYWx1ZSB7XHJcbiAgICAgICAgdmFyIHZhbCA9IHRoaXNba2V5LnRvU3RyaW5nKCldO1xyXG4gICAgICAgIGlmICh2YWwgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gPFRWYWx1ZT52YWw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRocm93IGBLZXkgJHtrZXl9IGlzIG5vdCBmb3VuZCBpbiBkaWN0aW9uYXJ5YDtcclxuICAgIH1cclxufVxyXG4iLCIvLy88cmVmZXJlbmNlIHBhdGg9XCIuLlxcLi5cXC4uXFxsaWJcXHR5cGluZ3NcXHRzZC5kLnRzXCIvPlxyXG5cclxubW9kdWxlIFBpeGlFeHRlbnNpb25zIHtcclxuICAgIGV4cG9ydCBpbnRlcmZhY2UgSUFuaW1hdGlvbiB7XHJcbiAgICAgICAgVXBkYXRlKGVsYXBzZWRNczogbnVtYmVyKTogdm9pZDtcclxuICAgICAgICBJc0NvbXBsZXRlZDogYm9vbGVhbjtcclxuICAgICAgICBPbkNvbXBsZXRlZDogKCkgPT4gdm9pZDtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgQW5pbWF0aW9uQmFzZSB7XHJcbiAgICAgICAgRW50aXR5OiBQSVhJLkRpc3BsYXlPYmplY3Q7XHJcbiAgICAgICAgSXNDb21wbGV0ZWQ6IGJvb2xlYW47XHJcbiAgICAgICAgcHJvdGVjdGVkIGR1cmF0aW9uUmVtYWluczogbnVtYmVyO1xyXG4gICAgICAgIE9uQ29tcGxldGVkOiAoKSA9PiB2b2lkO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihlbnRpdHk6IFBJWEkuRGlzcGxheU9iamVjdCwgZHVyYXRpb25Jbk1zOiBudW1iZXIsIG9uQ29tcGxldGVkOiAoKSA9PiB2b2lkKSB7XHJcbiAgICAgICAgICAgIGlmIChlbnRpdHkgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgJ0VudGl0eSBpcyBudWxsJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLkVudGl0eSA9IGVudGl0eTtcclxuICAgICAgICAgICAgdGhpcy5PbkNvbXBsZXRlZCA9IG9uQ29tcGxldGVkO1xyXG4gICAgICAgICAgICB0aGlzLmR1cmF0aW9uUmVtYWlucyA9IGR1cmF0aW9uSW5NcztcclxuICAgICAgICAgICAgdGhpcy5Jc0NvbXBsZXRlZCA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi8vLzxyZWZlcmVuY2UgcGF0aD1cInBpeGktYW5pbWF0aW9uLnRzXCIvPlxyXG5tb2R1bGUgUGl4aUV4dGVuc2lvbnMge1xyXG4gICAgZXhwb3J0IGNsYXNzIEFuaW1hdGlvblBhcmFsbGVsIGltcGxlbWVudHMgSUFuaW1hdGlvbiB7XHJcbiAgICAgICAgQW5pbWF0aW9uczogSUFuaW1hdGlvbltdID0gW107XHJcbiAgICAgICAgT25Db21wbGV0ZWQ6ICgpID0+IHZvaWQ7XHJcbiAgICAgICAgSXNDb21wbGV0ZWQ6IGJvb2xlYW47XHJcbiAgICAgICAgcHJpdmF0ZSBvbkNvbXBsZXRlZEludGVybmFsOiAoKSA9PiB2b2lkO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihhbmltYXRpb25zOiBJQW5pbWF0aW9uW10sIG9uQ29tcGxldGVkOiAoKSA9PiB2b2lkID0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLkFuaW1hdGlvbnMgPSBhbmltYXRpb25zO1xyXG4gICAgICAgICAgICB0aGlzLk9uQ29tcGxldGVkID0gb25Db21wbGV0ZWQ7XHJcbiAgICAgICAgICAgIHRoaXMuSXNDb21wbGV0ZWQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFVwZGF0ZShlbGFwc2VkTXM6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5BbmltYXRpb25zLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBjb21wbGV0ZWRFdmVudHMgPSA8QXJyYXk8KCkgPT4gdm9pZD4+W107XHJcbiAgICAgICAgICAgIHZhciBwcm9jZXNzZWRBbmltYXRpb25zID0gdGhpcy5BbmltYXRpb25zLmZpbHRlcigoYW5pbWF0aW9uOiBJQW5pbWF0aW9uKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBhbmltYXRpb24uVXBkYXRlKGVsYXBzZWRNcyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoYW5pbWF0aW9uLklzQ29tcGxldGVkICYmIGFuaW1hdGlvbi5PbkNvbXBsZXRlZCAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29tcGxldGVkRXZlbnRzLnB1c2goYW5pbWF0aW9uLk9uQ29tcGxldGVkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiAhYW5pbWF0aW9uLklzQ29tcGxldGVkO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuQW5pbWF0aW9ucyA9IHByb2Nlc3NlZEFuaW1hdGlvbnM7XHJcbiAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIGNhbGwgY29tcGxldGVkIGV2ZW50c1xyXG4gICAgICAgICAgICBjb21wbGV0ZWRFdmVudHMuZm9yRWFjaChlID0+IGUoKSk7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5BbmltYXRpb25zLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLklzQ29tcGxldGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgQW5pbWF0aW9uUXVldWUgaW1wbGVtZW50cyBJQW5pbWF0aW9uIHtcclxuICAgICAgICBBbmltYXRpb25zOiBJQW5pbWF0aW9uW10gPSBbXTtcclxuICAgICAgICBPbkNvbXBsZXRlZDogKCkgPT4gdm9pZDtcclxuICAgICAgICBJc0NvbXBsZXRlZDogYm9vbGVhbjtcclxuICAgICAgICBwcml2YXRlIG9uQ29tcGxldGVkSW50ZXJuYWw6ICgpID0+IHZvaWQ7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKGFuaW1hdGlvbnM6IElBbmltYXRpb25bXSwgb25Db21wbGV0ZWQ6ICgpID0+IHZvaWQgPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuQW5pbWF0aW9ucyA9IGFuaW1hdGlvbnM7XHJcbiAgICAgICAgICAgIHRoaXMuT25Db21wbGV0ZWQgPSBvbkNvbXBsZXRlZDtcclxuICAgICAgICAgICAgdGhpcy5Jc0NvbXBsZXRlZCA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgVXBkYXRlKGVsYXBzZWRNczogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLkFuaW1hdGlvbnMubGVuZ3RoID09IDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIGFuaW1hdGlvbiA9IHRoaXMuQW5pbWF0aW9uc1swXTtcclxuICAgICAgICAgICAgYW5pbWF0aW9uLlVwZGF0ZShlbGFwc2VkTXMpO1xyXG4gICAgICAgICAgICBpZiAoYW5pbWF0aW9uLklzQ29tcGxldGVkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYW5pbWF0aW9uLk9uQ29tcGxldGVkICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBhbmltYXRpb24uT25Db21wbGV0ZWQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuQW5pbWF0aW9ucy5zcGxpY2UoMCwgMSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLkFuaW1hdGlvbnMubGVuZ3RoID09IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuSXNDb21wbGV0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiLy8vPHJlZmVyZW5jZSBwYXRoPVwicGl4aS1hbmltYXRpb24tY29tYmluZWQudHNcIi8+XHJcbm1vZHVsZSBQaXhpRXh0ZW5zaW9ucyB7XHJcbiAgICBleHBvcnQgY2xhc3MgQW5pbWF0aW9uc01hbmFnZXIgZXh0ZW5kcyBBbmltYXRpb25QYXJhbGxlbCB7XHJcbiAgICAgICAgY29uc3RydWN0b3Iob25Db21wbGV0ZWQ6ICgpID0+IHZvaWQgPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKFtdLCBvbkNvbXBsZXRlZCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBBZGRBbmltYXRpb24oYW5pbWF0aW9uOiBJQW5pbWF0aW9uKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHRoaXMuQW5pbWF0aW9ucy5wdXNoKGFuaW1hdGlvbik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBVcGRhdGUoZWxhcHNlZE1zOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgICAgICAgdmFyIGhhc0FuaW1hdGlvbnMgPSAodGhpcy5BbmltYXRpb25zLmxlbmd0aCA+IDApO1xyXG5cclxuICAgICAgICAgICAgc3VwZXIuVXBkYXRlKGVsYXBzZWRNcyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoaGFzQW5pbWF0aW9ucyAmJiAodGhpcy5BbmltYXRpb25zLmxlbmd0aCA9PSAwKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuT25Db21wbGV0ZWQgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuT25Db21wbGV0ZWQoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi8vLzxyZWZlcmVuY2UgcGF0aD1cInBpeGktYW5pbWF0aW9uLnRzXCIvPlxyXG5tb2R1bGUgUGl4aUV4dGVuc2lvbnMge1xyXG4gICAgZXhwb3J0IGludGVyZmFjZSBFbnRpdHlQb3NpdGlvbiB7XHJcbiAgICAgICAgeDogbnVtYmVyO1xyXG4gICAgICAgIHk6IG51bWJlcjtcclxuICAgIH1cclxuXHJcbiAgICBleHBvcnQgY2xhc3MgQW5pbWF0aW9uTW92ZSBleHRlbmRzIEFuaW1hdGlvbkJhc2UgaW1wbGVtZW50cyBJQW5pbWF0aW9uIHtcclxuICAgICAgICBUYXJnZXRQb3NpdGlvbjogRW50aXR5UG9zaXRpb247XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKGVudGl0eTogUElYSS5EaXNwbGF5T2JqZWN0LCBkdXJhdGlvbkluTXM6IG51bWJlciwgbmV3UG9zaXRpb246IEVudGl0eVBvc2l0aW9uLCBvbkNvbXBsZXRlZDogKCkgPT4gdm9pZCA9IG51bGwpIHtcclxuICAgICAgICAgICAgc3VwZXIoZW50aXR5LCBkdXJhdGlvbkluTXMsIG9uQ29tcGxldGVkKTtcclxuICAgICAgICAgICAgdGhpcy5UYXJnZXRQb3NpdGlvbiA9IG5ld1Bvc2l0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgVXBkYXRlKGVsYXBzZWRNczogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmR1cmF0aW9uUmVtYWlucyA+IGVsYXBzZWRNcykge1xyXG4gICAgICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIGR4IGFuZCBkeVxyXG4gICAgICAgICAgICAgICAgdmFyIGR4ID0gKGVsYXBzZWRNcyAqICh0aGlzLlRhcmdldFBvc2l0aW9uLnggLSB0aGlzLkVudGl0eS54KSkgLyB0aGlzLmR1cmF0aW9uUmVtYWlucztcclxuICAgICAgICAgICAgICAgIHZhciBkeSA9IChlbGFwc2VkTXMgKiAodGhpcy5UYXJnZXRQb3NpdGlvbi55IC0gdGhpcy5FbnRpdHkueSkpIC8gdGhpcy5kdXJhdGlvblJlbWFpbnM7XHJcbiAgICAgICAgICAgICAgICB0aGlzLkVudGl0eS54ICs9IGR4O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5FbnRpdHkueSArPSBkeTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZHVyYXRpb25SZW1haW5zIC09IGVsYXBzZWRNcztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIEhlcmUgaXMgZmluYWwgY2FsbFxyXG4gICAgICAgICAgICAgICAgdGhpcy5FbnRpdHkueCA9IHRoaXMuVGFyZ2V0UG9zaXRpb24ueDtcclxuICAgICAgICAgICAgICAgIHRoaXMuRW50aXR5LnkgPSB0aGlzLlRhcmdldFBvc2l0aW9uLnk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLklzQ29tcGxldGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZHVyYXRpb25SZW1haW5zID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4iLCIvLy88cmVmZXJlbmNlIHBhdGg9XCIuLlxcLi5cXC4uXFxsaWJcXHR5cGluZ3NcXHRzZC5kLnRzXCIvPlxyXG4vLy88cmVmZXJlbmNlIHBhdGg9XCIuLlxcaGVscGVyc1xcZGljdGlvbmFyeS50c1wiLz5cclxuXHJcbi8vLzxyZWZlcmVuY2UgcGF0aD1cInBpeGktYW5pbWF0aW9uLW1hbmFnZXIudHNcIi8+XHJcbi8vLzxyZWZlcmVuY2UgcGF0aD1cInBpeGktYW5pbWF0aW9uLW1vdmUudHNcIi8+XHJcbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uXFxnYW1lMjA0OC50c1wiLz5cclxuXHJcbm1vZHVsZSBQaXhpR2FtZVJlbmRlciB7XHJcblxyXG4gICAgZXhwb3J0IGNsYXNzIFRpbGVTcHJpdGUgZXh0ZW5kcyBQSVhJLkNvbnRhaW5lciB7XHJcbiAgICAgICAgVGlsZUtleTogc3RyaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBSZW5kZXJIZWxwZXIge1xyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgVGlsZVNpemUgPSA1MDtcclxuICAgICAgICBwdWJsaWMgc3RhdGljIFRpbGVTaXplSGFsZiA9IDI1O1xyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIENyZWF0ZVRpbGVTcHJpdGUoaXJvdzogbnVtYmVyLCBpY2VsbDogbnVtYmVyLCB0aWxlVmFsdWU6IG51bWJlciwga2V5OiBzdHJpbmcpOiBUaWxlU3ByaXRlIHtcclxuICAgICAgICAgICAgLy9DcmVhdGUgZ3JhcGhpY3MgZm9yIGNlbGxcclxuICAgICAgICAgICAgdmFyIHRpbGVTcHJpdGUgPSBuZXcgVGlsZVNwcml0ZSgpO1xyXG4gICAgICAgICAgICB0aWxlU3ByaXRlLlRpbGVLZXkgPSBrZXk7XHJcbiAgICAgICAgICAgIHRpbGVTcHJpdGUud2lkdGggPSB0aGlzLlRpbGVTaXplO1xyXG4gICAgICAgICAgICB0aWxlU3ByaXRlLmhlaWdodCA9IHRoaXMuVGlsZVNpemU7XHJcblxyXG4gICAgICAgICAgICB2YXIgdGlsZUdyYXBoaWNzID0gbmV3IFBJWEkuR3JhcGhpY3M7XHJcbiAgICAgICAgICAgIHRpbGVHcmFwaGljcy5saW5lU3R5bGUoMSwgMHhlMGUwZTAsIDEpO1xyXG4gICAgICAgICAgICB0aWxlR3JhcGhpY3MuYmVnaW5GaWxsKHRoaXMuZ2V0VGlsZUJnQ29sb3IodGlsZVZhbHVlKSwgMSk7XHJcbiAgICAgICAgICAgIHRpbGVHcmFwaGljcy5kcmF3UmVjdCgwLCAwLCB0aGlzLlRpbGVTaXplLCB0aGlzLlRpbGVTaXplKTtcclxuICAgICAgICAgICAgdGlsZUdyYXBoaWNzLmVuZEZpbGwoKTtcclxuICAgICAgICAgICAgdGlsZUdyYXBoaWNzLnggPSAtdGhpcy5UaWxlU2l6ZUhhbGY7XHJcbiAgICAgICAgICAgIHRpbGVHcmFwaGljcy55ID0gLXRoaXMuVGlsZVNpemVIYWxmO1xyXG4gICAgICAgICAgICB0aWxlU3ByaXRlLmFkZENoaWxkKHRpbGVHcmFwaGljcyk7XHJcblxyXG4gICAgICAgICAgICB2YXIgc3R5bGUgPSA8UElYSS5UZXh0U3R5bGU+e1xyXG4gICAgICAgICAgICAgICAgZm9udDogdGhpcy5nZXRUaWxlRm9udFNpemUodGlsZVZhbHVlKSArICcgSW5jb25zb2xhdGEsIENvdXJpZXIgTmV3JyxcclxuICAgICAgICAgICAgICAgIGZpbGw6IFwiI1wiICsgdGhpcy5nZXRUaWxlVGV4dENvbG9yKHRpbGVWYWx1ZSkudG9TdHJpbmcoMTYpXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHZhciB0aWxlVGV4dCA9IG5ldyBQSVhJLlRleHQodGlsZVZhbHVlLnRvU3RyaW5nKCksIHN0eWxlKTtcclxuICAgICAgICAgICAgdGlsZVRleHQueCA9IHRoaXMuZ2V0VGlsZVRleHRYT2Zmc2V0KHRpbGVWYWx1ZSkgLSB0aGlzLlRpbGVTaXplSGFsZjtcclxuICAgICAgICAgICAgdGlsZVRleHQueSA9IHRoaXMuZ2V0VGlsZVRleHRZT2Zmc2V0KHRpbGVWYWx1ZSkgLSB0aGlzLlRpbGVTaXplSGFsZjtcclxuICAgICAgICAgICAgdGlsZVNwcml0ZS5hZGRDaGlsZCh0aWxlVGV4dCk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGlsZVNwcml0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgQ3JlYXRlU2NvcmVzVGV4dCgpOiBQSVhJLlRleHQge1xyXG4gICAgICAgICAgICB2YXIgc3R5bGUgPSA8UElYSS5UZXh0U3R5bGU+e1xyXG4gICAgICAgICAgICAgICAgZm9udDogJzMycHggSW5jb25zb2xhdGEsIENvdXJpZXIgTmV3JyxcclxuICAgICAgICAgICAgICAgIGZpbGw6IFwiIzc3NkU2NVwiXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHZhciBzY29yZXNUZXh0ID0gbmV3IFBJWEkuVGV4dChcIjBcIiwgc3R5bGUpO1xyXG4gICAgICAgICAgICBzY29yZXNUZXh0LnggPSB0aGlzLlRpbGVTaXplO1xyXG4gICAgICAgICAgICBzY29yZXNUZXh0LnkgPSAxNjtcclxuICAgICAgICAgICAgcmV0dXJuIHNjb3Jlc1RleHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIEdyZWF0ZUdhbWVPdmVyR3JhcGhpY3MoKTogUElYSS5EaXNwbGF5T2JqZWN0IHtcclxuICAgICAgICAgICAgdmFyIHN0eWxlID0gPFBJWEkuVGV4dFN0eWxlPntcclxuICAgICAgICAgICAgICAgIGZvbnQ6ICczMnB4IEluY29uc29sYXRhLCBDb3VyaWVyIE5ldycsXHJcbiAgICAgICAgICAgICAgICBmaWxsOiBcIiM3NzZFNjVcIlxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB2YXIgdGV4dCA9IG5ldyBQSVhJLlRleHQoXCJHQU1FIE9WRVJcIiwgc3R5bGUpO1xyXG4gICAgICAgICAgICB0ZXh0LnggPSB0aGlzLlRpbGVTaXplO1xyXG4gICAgICAgICAgICB0ZXh0LnkgPSA0NjtcclxuICAgICAgICAgICAgcmV0dXJuIHRleHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwdWJsaWMgc3RhdGljIENyZWF0ZU90aGVyU3RhdGljKGdhbWU6IEdhbWUyMDQ4KTogUElYSS5EaXNwbGF5T2JqZWN0IHtcclxuICAgICAgICAgICAgLy8gY3JlYXRlIGZyYW1lXHJcbiAgICAgICAgICAgIHZhciBzaXplID0gZ2FtZS5HcmlkLlNpemU7XHJcbiAgICAgICAgICAgIHZhciBmcmFtZSA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XHJcbiAgICAgICAgICAgIHZhciBib3JkZXIgPSA4O1xyXG4gICAgICAgICAgICBmcmFtZS5saW5lU3R5bGUoMSwgMHhlMGUwZTAsIDEpO1xyXG4gICAgICAgICAgICBmcmFtZS5kcmF3UmVjdCh0aGlzLlRpbGVTaXplICogMiAtIGJvcmRlciwgdGhpcy5UaWxlU2l6ZSAqIDIgLSBib3JkZXIsIHRoaXMuVGlsZVNpemUgKiBzaXplICsgYm9yZGVyICsgYm9yZGVyLCB0aGlzLlRpbGVTaXplICogc2l6ZSArIGJvcmRlciArIGJvcmRlcik7XHJcbiAgICAgICAgICAgIHJldHVybiBmcmFtZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHB1YmxpYyBzdGF0aWMgQ2FsY3VsYXRlVGlsZUNvb3JkaW5hdGVzKGZpZzogUGl4aUV4dGVuc2lvbnMuRW50aXR5UG9zaXRpb24sIGlSb3c6IG51bWJlciwgaUNlbGw6IG51bWJlcikge1xyXG4gICAgICAgICAgICBmaWcueCA9IHRoaXMuVGlsZVNpemUgKiAyICsgaUNlbGwgKiB0aGlzLlRpbGVTaXplICsgdGhpcy5UaWxlU2l6ZUhhbGY7XHJcbiAgICAgICAgICAgIGZpZy55ID0gdGhpcy5UaWxlU2l6ZSAqIDIgKyBpUm93ICogdGhpcy5UaWxlU2l6ZSArIHRoaXMuVGlsZVNpemVIYWxmO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgZ2V0VGlsZUZvbnRTaXplKHZhbHVlOiBudW1iZXIpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICBpZiAodmFsdWUgPCAxMDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIjMycHhcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodmFsdWUgPCAxMDAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCIyOHB4XCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHZhbHVlIDwgMTAwMDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBcIjIycHhcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gXCIxOHB4XCI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHN0YXRpYyBnZXRUaWxlVGV4dFhPZmZzZXQodmFsdWU6IG51bWJlcik6IG51bWJlciB7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA8IDEwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMTc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHZhbHVlIDwgMTAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gODtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodmFsdWUgPCAxMDAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gMjtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgZ2V0VGlsZVRleHRZT2Zmc2V0KHZhbHVlOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICAgICAgICBpZiAodmFsdWUgPCAxMDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAxMztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodmFsdWUgPCAxMDAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gMTY7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIDE3O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBzdGF0aWMgZ2V0VGlsZVRleHRDb2xvcih2YWx1ZTogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlID4gNFxyXG4gICAgICAgICAgICAgICAgPyAweEY5RjZGMlxyXG4gICAgICAgICAgICAgICAgOiAweDc3NkU2NTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgc3RhdGljIGdldFRpbGVCZ0NvbG9yKHZhbHVlOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDB4ZWVlNGRhO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAweEVERTBDODtcclxuICAgICAgICAgICAgICAgIGNhc2UgODpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMHhGMkIxNzk7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDE2OlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAweEY1OTU2MztcclxuICAgICAgICAgICAgICAgIGNhc2UgMzI6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDB4RjY3QzVGO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA2NDpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMHhGNjVFM0I7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDEyODpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMHhFRENGNzI7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDI1NjpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMHhFRENDNjE7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDUxMjpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMHhFREM4NTA7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDEwMjQ6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDB4RURDNTNGO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAyMDQ4OlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAweEVEQzIyRTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNDA5NjpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMHhlZGMyMmU7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDgxOTI6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDB4ZWRjMjJlO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMHhlZGMyMmU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvLy88cmVmZXJlbmNlIHBhdGg9XCIuLlxcLi5cXC4uXFxsaWJcXHR5cGluZ3NcXHRzZC5kLnRzXCIvPlxyXG4vLy88cmVmZXJlbmNlIHBhdGg9XCIuLlxcaGVscGVyc1xcZGljdGlvbmFyeS50c1wiLz5cclxuXHJcbi8vLzxyZWZlcmVuY2UgcGF0aD1cInBpeGktYW5pbWF0aW9uLW1hbmFnZXIudHNcIi8+XHJcbi8vLzxyZWZlcmVuY2UgcGF0aD1cInBpeGktYW5pbWF0aW9uLW1vdmUudHNcIi8+XHJcbi8vLzxyZWZlcmVuY2UgcGF0aD1cIi4uXFxnYW1lMjA0OC50c1wiLz5cclxuLy8vPHJlZmVyZW5jZSBwYXRoPVwicGl4aS1nYW1lLXJlbmRlci1oZWxwZXIudHNcIi8+XHJcblxyXG5tb2R1bGUgUGl4aUdhbWVSZW5kZXIge1xyXG5cclxuICAgIGV4cG9ydCBjbGFzcyBSZW5kZXIgaW1wbGVtZW50cyBJR2FtZTIwNDhSZW5kZXIge1xyXG4gICAgICAgIE9uVHVybkFuaW1hdGlvbnNDb21wbGV0ZWQ6IE9ic2VydmFibGU8dm9pZD4gPSBuZXcgT2JzZXJ2YWJsZTx2b2lkPigpO1xyXG5cclxuICAgICAgICBwcml2YXRlIHN0YWdlOiBQSVhJLkNvbnRhaW5lcjtcclxuICAgICAgICBwcml2YXRlIHRpbGVzOiBEaWN0aW9uYXJ5PHN0cmluZywgVGlsZVNwcml0ZT4gPSBuZXcgRGljdGlvbmFyeTxzdHJpbmcsIFRpbGVTcHJpdGU+KFtdKTtcclxuICAgICAgICBwcml2YXRlIHNjb3Jlc1RleHQ6IFBJWEkuVGV4dDtcclxuICAgICAgICBwcml2YXRlIGZwc1RleHQ6IFBJWEkuVGV4dDtcclxuICAgICAgICBwcml2YXRlIHN0YXRpY1Jvb3Q6IFBJWEkuQ29udGFpbmVyID0gbnVsbDtcclxuICAgICAgICBwcml2YXRlIGdhbWU6IEdhbWUyMDQ4O1xyXG4gICAgICAgIHByaXZhdGUgYW5pbWF0aW9uc01hbmFnZXI6IFBpeGlFeHRlbnNpb25zLkFuaW1hdGlvbnNNYW5hZ2VyO1xyXG4gICAgICAgIHByaXZhdGUgZ2FtZU92ZXJSZW5kZXJlZDogYm9vbGVhbjtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoZG9jdW1lbnQ6IERvY3VtZW50LCBnYW1lOiBHYW1lMjA0OCkge1xyXG4gICAgICAgICAgICB0aGlzLmdhbWUgPSBnYW1lO1xyXG5cclxuICAgICAgICAgICAgdmFyIHJlbmRlcmVyID0gUElYSS5hdXRvRGV0ZWN0UmVuZGVyZXIoNDAwLCA0MDAsIHsgYmFja2dyb3VuZENvbG9yOiAweGVGZUZlRiB9KTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChyZW5kZXJlci52aWV3KTtcclxuXHJcbiAgICAgICAgICAgIC8vIGNyZWF0ZSB0aGUgcm9vdCBvZiB0aGUgc2NlbmUgZ3JhcGhcclxuICAgICAgICAgICAgdGhpcy5zdGFnZSA9IG5ldyBQSVhJLkNvbnRhaW5lcigpO1xyXG4gICAgICAgICAgICB0aGlzLlJlYnVpbGRHcmFwaGljcygpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5hbmltYXRpb25zTWFuYWdlciA9IG5ldyBQaXhpRXh0ZW5zaW9ucy5BbmltYXRpb25zTWFuYWdlcih0aGlzLm9uQW5pbWF0aW9uc0NvbXBsZXRlZC5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgICAgICAgIHZhciB0aWNrZXIgPSBuZXcgUElYSS50aWNrZXIuVGlja2VyKCk7XHJcbiAgICAgICAgICAgIHRpY2tlci5hZGQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hbmltYXRpb25zTWFuYWdlci5VcGRhdGUodGlja2VyLmVsYXBzZWRNUyk7XHJcblxyXG4gICAgICAgICAgICAgICAgcmVuZGVyZXIucmVuZGVyKHRoaXMuc3RhZ2UpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zY29yZXNUZXh0LnRleHQgPSBnYW1lLlNjb3Jlcy50b1N0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5mcHNUZXh0LnRleHQgPSB0aWNrZXIuRlBTLnRvRml4ZWQoMik7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB0aWNrZXIuc3RhcnQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFJlYnVpbGRHcmFwaGljcygpOiB2b2lkIHtcclxuICAgICAgICAgICAgdGhpcy5nYW1lT3ZlclJlbmRlcmVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMucmVidWlsZFN0YXRpY09iamVjdHMoKTtcclxuICAgICAgICAgICAgdGhpcy5yZWJ1aWxkRHluYW1pY09iamVjdHMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIE9uR2FtZUZpbmlzaGVkKCkge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZ2FtZU92ZXJSZW5kZXJlZCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGdvZyA9IFJlbmRlckhlbHBlci5HcmVhdGVHYW1lT3ZlckdyYXBoaWNzKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRpY1Jvb3QuYWRkQ2hpbGQoZ29nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmdhbWVPdmVyUmVuZGVyZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgT25UaWxlc1VwZGF0ZWQoZXZlbnQ6IFRpbGVVcGRhdGVFdmVudCkge1xyXG4gICAgICAgICAgICBpZiAoZXZlbnQgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIC8vIE5vIHRpbGVzIHdlcmUgbW92ZWRcclxuICAgICAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uc01hbmFnZXIuQWRkQW5pbWF0aW9uKG5ldyBQaXhpRXh0ZW5zaW9ucy5BbmltYXRpb25RdWV1ZShbXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFBpeGlFeHRlbnNpb25zLkFuaW1hdGlvblNjYWxlKHRoaXMuc2NvcmVzVGV4dCwgNTAsIDEuMyksXHJcbiAgICAgICAgICAgICAgICAgICAgbmV3IFBpeGlFeHRlbnNpb25zLkFuaW1hdGlvblNjYWxlKHRoaXMuc2NvcmVzVGV4dCwgMTAwLCAxKSxcclxuICAgICAgICAgICAgICAgIF0pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZXZlbnQgaW5zdGFuY2VvZiBUaWxlTW92ZUV2ZW50KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIG1vdmVFdmVudCA9IDxUaWxlTW92ZUV2ZW50PmV2ZW50O1xyXG4gICAgICAgICAgICAgICAgdmFyIHRpbGVUb01vdmUgPSB0aGlzLnRpbGVzLkdldCh0aGlzLmdldFRpbGVLZXkobW92ZUV2ZW50LlBvc2l0aW9uKSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVucmVnaXN0ZXJUaWxlKHRpbGVUb01vdmUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5icmluZ1RvRnJvbnQodGlsZVRvTW92ZSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgbmV3UG9zID0gPFBpeGlFeHRlbnNpb25zLkVudGl0eVBvc2l0aW9uPnt9O1xyXG4gICAgICAgICAgICAgICAgUmVuZGVySGVscGVyLkNhbGN1bGF0ZVRpbGVDb29yZGluYXRlcyhuZXdQb3MsIG1vdmVFdmVudC5OZXdQb3NpdGlvbi5Sb3dJbmRleCwgbW92ZUV2ZW50Lk5ld1Bvc2l0aW9uLkNlbGxJbmRleCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5hbmltYXRpb25zTWFuYWdlci5BZGRBbmltYXRpb24obmV3IFBpeGlFeHRlbnNpb25zLkFuaW1hdGlvbk1vdmUodGlsZVRvTW92ZSwgMTUwLCBuZXdQb3MsICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZVRpbGVHcmFwaGljcyh0aWxlVG9Nb3ZlKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIW1vdmVFdmVudC5TaG91bGRCZURlbGV0ZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld1RpbGUgPSB0aGlzLmFkZFRpbGVHcmFwaGljcyhtb3ZlRXZlbnQuTmV3UG9zaXRpb24uUm93SW5kZXgsIG1vdmVFdmVudC5OZXdQb3NpdGlvbi5DZWxsSW5kZXgsIG1vdmVFdmVudC5WYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVnaXN0ZXJUaWxlKG5ld1RpbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlVGlsZUdyYXBoaWNzKHRpbGVUb01vdmUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQgaW5zdGFuY2VvZiBUaWxlTWVyZ2VFdmVudCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBtZXJnZUV2ZW50ID0gPFRpbGVNZXJnZUV2ZW50PmV2ZW50O1xyXG4gICAgICAgICAgICAgICAgdmFyIHRpbGVUb01vdmUgPSB0aGlzLnRpbGVzLkdldCh0aGlzLmdldFRpbGVLZXkobWVyZ2VFdmVudC5Qb3NpdGlvbikpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy51bnJlZ2lzdGVyVGlsZSh0aWxlVG9Nb3ZlKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnJpbmdUb0Zyb250KHRpbGVUb01vdmUpO1xyXG4gICAgICAgICAgICAgICAgdmFyIG5ld1BvcyA9IDxQaXhpRXh0ZW5zaW9ucy5FbnRpdHlQb3NpdGlvbj57fTtcclxuICAgICAgICAgICAgICAgIFJlbmRlckhlbHBlci5DYWxjdWxhdGVUaWxlQ29vcmRpbmF0ZXMobmV3UG9zLCBtZXJnZUV2ZW50LlRpbGVQb3NUb01lcmdlV2l0aC5Sb3dJbmRleCwgbWVyZ2VFdmVudC5UaWxlUG9zVG9NZXJnZVdpdGguQ2VsbEluZGV4KTtcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGlvbnNNYW5hZ2VyLkFkZEFuaW1hdGlvbihcclxuICAgICAgICAgICAgICAgICAgICBuZXcgUGl4aUV4dGVuc2lvbnMuQW5pbWF0aW9uTW92ZSh0aWxlVG9Nb3ZlLCAxNTAsIG5ld1BvcywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZVRpbGVHcmFwaGljcyh0aWxlVG9Nb3ZlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld1RpbGUgPSB0aGlzLmFkZFRpbGVHcmFwaGljcyhtZXJnZUV2ZW50LlRpbGVQb3NUb01lcmdlV2l0aC5Sb3dJbmRleCwgbWVyZ2VFdmVudC5UaWxlUG9zVG9NZXJnZVdpdGguQ2VsbEluZGV4LCBtZXJnZUV2ZW50Lk5ld1ZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWdpc3RlclRpbGUobmV3VGlsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uc01hbmFnZXIuQWRkQW5pbWF0aW9uKG5ldyBQaXhpRXh0ZW5zaW9ucy5BbmltYXRpb25RdWV1ZShbXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgUGl4aUV4dGVuc2lvbnMuQW5pbWF0aW9uU2NhbGUobmV3VGlsZSwgNTAsIDEuMyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgUGl4aUV4dGVuc2lvbnMuQW5pbWF0aW9uU2NhbGUobmV3VGlsZSwgMTAwLCAxKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgXSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pKTtcclxuXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQgaW5zdGFuY2VvZiBUaWxlQ3JlYXRlZEV2ZW50KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGNyZWF0ZWRFdmVudCA9IDxUaWxlQ3JlYXRlZEV2ZW50PmV2ZW50O1xyXG4gICAgICAgICAgICAgICAgdmFyIG5ld1RpbGUgPSB0aGlzLmFkZFRpbGVHcmFwaGljcyhjcmVhdGVkRXZlbnQuUG9zaXRpb24uUm93SW5kZXgsIGNyZWF0ZWRFdmVudC5Qb3NpdGlvbi5DZWxsSW5kZXgsIGNyZWF0ZWRFdmVudC5UaWxlVmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWdpc3RlclRpbGUobmV3VGlsZSk7XHJcbiAgICAgICAgICAgICAgICBuZXdUaWxlLmFscGhhID0gMDtcclxuICAgICAgICAgICAgICAgIG5ld1RpbGUuc2NhbGUgPSBuZXcgUElYSS5Qb2ludCgwLjEsIDAuMSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGlvbnNNYW5hZ2VyLkFkZEFuaW1hdGlvbihuZXcgUGl4aUV4dGVuc2lvbnMuQW5pbWF0aW9uUXVldWUoW1xyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBQaXhpRXh0ZW5zaW9ucy5BbmltYXRpb25EZWxheSgyMDApLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBQaXhpRXh0ZW5zaW9ucy5BbmltYXRpb25GYWRlKG5ld1RpbGUsIDEsIDEpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5ldyBQaXhpRXh0ZW5zaW9ucy5BbmltYXRpb25TY2FsZShuZXdUaWxlLCAxNTAsIDEpXHJcbiAgICAgICAgICAgICAgICBdKSk7XHJcblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIG9uQW5pbWF0aW9uc0NvbXBsZXRlZCgpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ0FuaW1hdGlvbnMgY29tcGxldGVkISEnKTtcclxuXHJcbiAgICAgICAgICAgIC8vdGhpcy5yZWJ1aWxkRHluYW1pY09iamVjdHMoKTtcclxuICAgICAgICAgICAgdGhpcy5PblR1cm5BbmltYXRpb25zQ29tcGxldGVkLk5vdGlmeU9ic2VydmVycyhudWxsKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgcmVidWlsZFN0YXRpY09iamVjdHMoKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnN0YXRpY1Jvb3QgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdGFnZS5yZW1vdmVDaGlsZCh0aGlzLnN0YXRpY1Jvb3QpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLnN0YXRpY1Jvb3QgPSBuZXcgUElYSS5Db250YWluZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5zdGFnZS5hZGRDaGlsZCh0aGlzLnN0YXRpY1Jvb3QpO1xyXG5cclxuICAgICAgICAgICAgdmFyIG90aGVyU3RhdGljID0gUmVuZGVySGVscGVyLkNyZWF0ZU90aGVyU3RhdGljKHRoaXMuZ2FtZSk7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhdGljUm9vdC5hZGRDaGlsZChvdGhlclN0YXRpYyk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNjb3Jlc1RleHQgPSBSZW5kZXJIZWxwZXIuQ3JlYXRlU2NvcmVzVGV4dCgpO1xyXG4gICAgICAgICAgICB0aGlzLnN0YXRpY1Jvb3QuYWRkQ2hpbGQodGhpcy5zY29yZXNUZXh0KTtcclxuXHJcbiAgICAgICAgICAgIHZhciBzdHlsZSA9IDxQSVhJLlRleHRTdHlsZT57XHJcbiAgICAgICAgICAgICAgICBmb250OiAnSW5jb25zb2xhdGEsIENvdXJpZXIgTmV3JyxcclxuICAgICAgICAgICAgICAgIGZpbGw6ICcjMDA1NTIxJyxcclxuICAgICAgICAgICAgICAgIGxpbmVIZWlnaHQ6IDE0LFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB0aGlzLmZwc1RleHQgPSBuZXcgUElYSS5UZXh0KFwiXCIsIHN0eWxlKTtcclxuICAgICAgICAgICAgdGhpcy5mcHNUZXh0LnggPSAzMDA7XHJcbiAgICAgICAgICAgIHRoaXMuZnBzVGV4dC55ID0gODtcclxuICAgICAgICAgICAgdGhpcy5zdGF0aWNSb290LmFkZENoaWxkKHRoaXMuZnBzVGV4dCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHJlYnVpbGREeW5hbWljT2JqZWN0cygpIHtcclxuICAgICAgICAgICAgLy8gVXBkYXRlIHNjb3Jlc1xyXG4gICAgICAgICAgICB0aGlzLnNjb3Jlc1RleHQudGV4dCA9IHRoaXMuZ2FtZS5TY29yZXMudG9TdHJpbmcoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSBleGlzdGluZyB0aWxlc1xyXG4gICAgICAgICAgICB0aGlzLnRpbGVzLlZhbHVlcygpLmZvckVhY2goZWxlbWVudCA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0YWdlLnJlbW92ZUNoaWxkKGVsZW1lbnQpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc3RhZ2UuY2hpbGRyZW4uZm9yRWFjaCgoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0gaW5zdGFuY2VvZiBUaWxlU3ByaXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0ZvdW5kIG5vdCBkZWxldGVkICcgKyAoPFRpbGVTcHJpdGU+aXRlbSkuVGlsZUtleSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy50aWxlcyA9IG5ldyBEaWN0aW9uYXJ5PHN0cmluZywgVGlsZVNwcml0ZT4oW10pO1xyXG5cclxuICAgICAgICAgICAgLy8gQWRkIHRpbGVzIGZyb20gZ2FtZSBncmlkXHJcbiAgICAgICAgICAgIGZvciAodmFyIGlyb3cgPSAwOyBpcm93IDwgdGhpcy5nYW1lLkdyaWQuU2l6ZTsgKytpcm93KSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpY2VsbCA9IDA7IGljZWxsIDwgdGhpcy5nYW1lLkdyaWQuU2l6ZTsgKytpY2VsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciB0aWxlVmFsdWUgPSB0aGlzLmdhbWUuR3JpZC5DZWxsc1tpcm93XVtpY2VsbF07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRpbGVWYWx1ZSAhPSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0aWxlID0gdGhpcy5hZGRUaWxlR3JhcGhpY3MoaXJvdywgaWNlbGwsIHRpbGVWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVnaXN0ZXJUaWxlKHRpbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSByZWdpc3RlclRpbGUodGlsZTogVGlsZVNwcml0ZSk6IHZvaWQge1xyXG4gICAgICAgICAgICB0aGlzLnRpbGVzLkFkZCh0aWxlLlRpbGVLZXksIHRpbGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSB1bnJlZ2lzdGVyVGlsZSh0aWxlOiBUaWxlU3ByaXRlKTogdm9pZCB7XHJcbiAgICAgICAgICAgIHZhciBrZXkgPSB0aWxlLlRpbGVLZXk7XHJcbiAgICAgICAgICAgIHRoaXMudGlsZXMuUmVtb3ZlKGtleSk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1bnJlZ2lzdGVyZWQgJyArIGtleSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIHJlbW92ZVRpbGVHcmFwaGljcyh0aWxlOiBUaWxlU3ByaXRlKSB7XHJcbiAgICAgICAgICAgIGlmICghdGlsZS5wYXJlbnQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0aWxlIHBhcmVudCBpcyBudWxsJyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGlsZS5wYXJlbnQucmVtb3ZlQ2hpbGQodGlsZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwcml2YXRlIGFkZFRpbGVHcmFwaGljcyhpcm93OiBudW1iZXIsIGljZWxsOiBudW1iZXIsIHRpbGVWYWx1ZTogbnVtYmVyKTogVGlsZVNwcml0ZSB7XHJcbiAgICAgICAgICAgIHZhciB0aWxlS2V5ID0gdGhpcy5nZXRUaWxlS2V5KHsgUm93SW5kZXg6IGlyb3csIENlbGxJbmRleDogaWNlbGwgfSk7XHJcbiAgICAgICAgICAgIHZhciB0aWxlR3JhcGhpY3MgPSBSZW5kZXJIZWxwZXIuQ3JlYXRlVGlsZVNwcml0ZShpcm93LCBpY2VsbCwgdGlsZVZhbHVlLCB0aWxlS2V5KTtcclxuICAgICAgICAgICAgUmVuZGVySGVscGVyLkNhbGN1bGF0ZVRpbGVDb29yZGluYXRlcyh0aWxlR3JhcGhpY3MsIGlyb3csIGljZWxsKTtcclxuICAgICAgICAgICAgdGhpcy5zdGFnZS5hZGRDaGlsZCh0aWxlR3JhcGhpY3MpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGlsZUdyYXBoaWNzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcHJpdmF0ZSBicmluZ1RvRnJvbnQodGlsZTogUElYSS5EaXNwbGF5T2JqZWN0KSB7XHJcbiAgICAgICAgICAgIGlmICh0aWxlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcCA9IHRpbGUucGFyZW50O1xyXG4gICAgICAgICAgICAgICAgaWYgKHApIHtcclxuICAgICAgICAgICAgICAgICAgICBwLnJlbW92ZUNoaWxkKHRpbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHAuYWRkQ2hpbGQodGlsZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHByaXZhdGUgZ2V0VGlsZUtleShwb3M6IFRpbGVQb3NpdGlvbik6IHN0cmluZyB7XHJcbiAgICAgICAgICAgIHJldHVybiBwb3MuUm93SW5kZXgudG9TdHJpbmcoKSArIFwiX1wiICsgcG9zLkNlbGxJbmRleC50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi8vLzxyZWZlcmVuY2UgcGF0aD1cImdhbWUyMDQ4LnRzXCIvPlxyXG4vLy88cmVmZXJlbmNlIHBhdGg9XCJyZW5kZXIvcGl4aS1nYW1lLXJlbmRlci50c1wiLz5cclxuXHJcbmZ1bmN0aW9uIEluaXRHYW1lKCkge1xyXG4gICAgdmFyIGdhbWUgPSBuZXcgR2FtZTIwNDgoNCwgbmV3IERlZmF1bHRSYW5kb20oKSk7XHJcbiAgICB2YXIgcmVuZGVyID0gbmV3IFBpeGlHYW1lUmVuZGVyLlJlbmRlcihkb2N1bWVudCwgZ2FtZSk7XHJcbiAgICBnYW1lLkJpbmRSZW5kZXIocmVuZGVyKTtcclxuXHJcbiAgICBNb3VzZXRyYXAuYmluZCgndXAnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBnYW1lLkFjdGlvbihEaXJlY3Rpb24uVXApO1xyXG4gICAgfSk7XHJcblxyXG4gICAgTW91c2V0cmFwLmJpbmQoJ2Rvd24nLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBnYW1lLkFjdGlvbihEaXJlY3Rpb24uRG93bik7XHJcbiAgICB9KTtcclxuXHJcbiAgICBNb3VzZXRyYXAuYmluZCgnbGVmdCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGdhbWUuQWN0aW9uKERpcmVjdGlvbi5MZWZ0KTtcclxuICAgIH0pO1xyXG5cclxuICAgIE1vdXNldHJhcC5iaW5kKCdyaWdodCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGdhbWUuQWN0aW9uKERpcmVjdGlvbi5SaWdodCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udHJvbC11cCcpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgZ2FtZS5BY3Rpb24oRGlyZWN0aW9uLlVwKTtcclxuICAgIH0pO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRyb2wtZG93bicpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgZ2FtZS5BY3Rpb24oRGlyZWN0aW9uLkRvd24pO1xyXG4gICAgfSk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udHJvbC1sZWZ0JykuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICBnYW1lLkFjdGlvbihEaXJlY3Rpb24uTGVmdCk7XHJcbiAgICB9KTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250cm9sLXJpZ2h0JykuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICBnYW1lLkFjdGlvbihEaXJlY3Rpb24uUmlnaHQpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bi1zYXZlJykuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICB2YXIgZ2FtZXN0YXRlID0gZ2FtZS5TZXJpYWxpemUoKTtcclxuICAgICAgICB2YXIgZmlsZSA9IG5ldyBGaWxlKFtnYW1lc3RhdGVdLCBcImdhbWUyMDQ4LnR4dFwiLCB7IHR5cGU6ICdwbGFpbi90ZXh0JyB9KTtcclxuICAgICAgICBsb2NhdGlvbi5ocmVmID0gVVJMLmNyZWF0ZU9iamVjdFVSTChmaWxlKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dC1sb2FkJykuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoZXZ0OiBhbnkpID0+IHtcclxuICAgICAgICB2YXIgZmlsZXMgPSBldnQudGFyZ2V0LmZpbGVzOyAvLyBGaWxlTGlzdCBvYmplY3RcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGY7IGYgPSBmaWxlc1tpXTsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG4gICAgICAgICAgICAvLyBDbG9zdXJlIHRvIGNhcHR1cmUgdGhlIGZpbGUgaW5mb3JtYXRpb24uXHJcbiAgICAgICAgICAgIHJlYWRlci5vbmxvYWQgPSAoZnVuY3Rpb24odGhlRmlsZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZ2FtZVN0YXRlID0gZS50YXJnZXQucmVzdWx0O1xyXG4gICAgICAgICAgICAgICAgICAgIGdhbWUuSW5pdEZyb21TdGF0ZShnYW1lU3RhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbmRlci5SZWJ1aWxkR3JhcGhpY3MoKTtcclxuICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9KShmKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlYWQgaW4gdGhlIGltYWdlIGZpbGUgYXMgYSBkYXRhIFVSTC5cclxuICAgICAgICAgICAgcmVhZGVyLnJlYWRBc1RleHQoZik7XHJcbiAgICAgICAgfVxyXG4gICAgfSwgZmFsc2UpO1xyXG59XHJcblxyXG5Jbml0R2FtZSgpO1xyXG4iLCJjbGFzcyBDb21tb25Ub29scyB7XHJcbiAgICBwdWJsaWMgc3RhdGljIENvbnNvbGVMb2cobWVzc2FnZTogc3RyaW5nLCBkYXRhOiBBcnJheTxhbnk+LCBpc0JvbGQ6IGJvb2xlYW4gPSBmYWxzZSwgY29sb3I6IHN0cmluZyA9IG51bGwpIHtcclxuICAgICAgICB2YXIgc3R5bGUgPSAnJztcclxuICAgICAgICBpZiAoaXNCb2xkKSB7XHJcbiAgICAgICAgICAgIHN0eWxlICs9ICdmb250LXdlaWdodDpib2xkOyAnXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChjb2xvciAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHN0eWxlICs9ICdjb2xvcjonICsgY29sb3IgKyAnOyAnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoc3R5bGUgIT0gJycpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJyVjJyArIG1lc3NhZ2UsIHN0eWxlLCBkYXRhKTtcclxuICAgICAgICB9IGVsc2V7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG1lc3NhZ2UsIGRhdGEpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi8vLzxyZWZlcmVuY2UgcGF0aD1cInBpeGktYW5pbWF0aW9uLnRzXCIvPlxyXG5tb2R1bGUgUGl4aUV4dGVuc2lvbnMge1xyXG4gICAgZXhwb3J0IGNsYXNzIEFuaW1hdGlvbkRlbGF5IGltcGxlbWVudHMgSUFuaW1hdGlvbiB7XHJcbiAgICAgICAgSXNDb21wbGV0ZWQ6IGJvb2xlYW47XHJcbiAgICAgICAgT25Db21wbGV0ZWQ6ICgpID0+IHZvaWQ7XHJcbiAgICAgICAgcHJvdGVjdGVkIGR1cmF0aW9uUmVtYWluczogbnVtYmVyO1xyXG5cclxuICAgICAgICBjb25zdHJ1Y3RvcihkdXJhdGlvbkluTXM6IG51bWJlciwgb25Db21wbGV0ZWQ6ICgpID0+IHZvaWQgPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZHVyYXRpb25SZW1haW5zID0gZHVyYXRpb25Jbk1zO1xyXG4gICAgICAgICAgICB0aGlzLklzQ29tcGxldGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuT25Db21wbGV0ZWQgPSBvbkNvbXBsZXRlZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFVwZGF0ZShlbGFwc2VkTXM6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kdXJhdGlvblJlbWFpbnMgPiBlbGFwc2VkTXMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZHVyYXRpb25SZW1haW5zIC09IGVsYXBzZWRNcztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIEhlcmUgaXMgZmluYWwgY2FsbFxyXG4gICAgICAgICAgICAgICAgdGhpcy5Jc0NvbXBsZXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmR1cmF0aW9uUmVtYWlucyA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvLy88cmVmZXJlbmNlIHBhdGg9XCJwaXhpLWFuaW1hdGlvbi50c1wiLz5cclxubW9kdWxlIFBpeGlFeHRlbnNpb25zIHtcclxuICAgIGV4cG9ydCBjbGFzcyBBbmltYXRpb25GYWRlIGV4dGVuZHMgQW5pbWF0aW9uQmFzZSBpbXBsZW1lbnRzIElBbmltYXRpb24ge1xyXG4gICAgICAgIFRhcmdldE9wYWNpdHk6IG51bWJlcjtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoZW50aXR5OiBQSVhJLkRpc3BsYXlPYmplY3QsIGR1cmF0aW9uSW5NczogbnVtYmVyLCBuZXdPcGFjaXR5OiBudW1iZXIsIG9uQ29tcGxldGVkOiAoKSA9PiB2b2lkID0gbnVsbCkge1xyXG4gICAgICAgICAgICBzdXBlcihlbnRpdHksIGR1cmF0aW9uSW5Ncywgb25Db21wbGV0ZWQpO1xyXG4gICAgICAgICAgICB0aGlzLlRhcmdldE9wYWNpdHkgPSBuZXdPcGFjaXR5O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgVXBkYXRlKGVsYXBzZWRNczogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmR1cmF0aW9uUmVtYWlucyA+IGVsYXBzZWRNcykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGQgPSAoZWxhcHNlZE1zICogKHRoaXMuVGFyZ2V0T3BhY2l0eSAtIHRoaXMuRW50aXR5LmFscGhhKSkgLyB0aGlzLmR1cmF0aW9uUmVtYWlucztcclxuICAgICAgICAgICAgICAgIHRoaXMuRW50aXR5LmFscGhhICs9IGQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmR1cmF0aW9uUmVtYWlucyAtPSBlbGFwc2VkTXM7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBIZXJlIGlzIGZpbmFsIGNhbGxcclxuICAgICAgICAgICAgICAgIHRoaXMuRW50aXR5LmFscGhhID0gdGhpcy5UYXJnZXRPcGFjaXR5O1xyXG4gICAgICAgICAgICAgICAgdGhpcy5Jc0NvbXBsZXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmR1cmF0aW9uUmVtYWlucyA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvLy88cmVmZXJlbmNlIHBhdGg9XCJwaXhpLWFuaW1hdGlvbi50c1wiLz5cclxubW9kdWxlIFBpeGlFeHRlbnNpb25zIHtcclxuICAgIGV4cG9ydCBjbGFzcyBBbmltYXRpb25Sb3RhdGUgZXh0ZW5kcyBBbmltYXRpb25CYXNlIGltcGxlbWVudHMgSUFuaW1hdGlvbiB7XHJcbiAgICAgICAgVGFyZ2V0Um90YXRpb246IG51bWJlcjtcclxuXHJcbiAgICAgICAgY29uc3RydWN0b3IoZW50aXR5OiBQSVhJLkRpc3BsYXlPYmplY3QsIGR1cmF0aW9uSW5NczogbnVtYmVyLCBhZGRSb3RhdGlvbjogbnVtYmVyLCBvbkNvbXBsZXRlZDogKCkgPT4gdm9pZCA9IG51bGwpIHtcclxuICAgICAgICAgICAgc3VwZXIoZW50aXR5LCBkdXJhdGlvbkluTXMsIG9uQ29tcGxldGVkKTtcclxuICAgICAgICAgICAgdGhpcy5UYXJnZXRSb3RhdGlvbiA9IGVudGl0eS5yb3RhdGlvbiArIGFkZFJvdGF0aW9uO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgVXBkYXRlKGVsYXBzZWRNczogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmR1cmF0aW9uUmVtYWlucyA+IGVsYXBzZWRNcykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGQgPSAoZWxhcHNlZE1zICogKHRoaXMuVGFyZ2V0Um90YXRpb24gLSB0aGlzLkVudGl0eS5yb3RhdGlvbikpIC8gdGhpcy5kdXJhdGlvblJlbWFpbnM7XHJcbiAgICAgICAgICAgICAgICB0aGlzLkVudGl0eS5yb3RhdGlvbiArPSBkO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kdXJhdGlvblJlbWFpbnMgLT0gZWxhcHNlZE1zO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLy8gSGVyZSBpcyBmaW5hbCBjYWxsXHJcbiAgICAgICAgICAgICAgICB0aGlzLkVudGl0eS5yb3RhdGlvbiA9IHRoaXMuVGFyZ2V0Um90YXRpb247XHJcbiAgICAgICAgICAgICAgICB0aGlzLklzQ29tcGxldGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZHVyYXRpb25SZW1haW5zID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi8vLzxyZWZlcmVuY2UgcGF0aD1cInBpeGktYW5pbWF0aW9uLnRzXCIvPlxyXG5tb2R1bGUgUGl4aUV4dGVuc2lvbnMge1xyXG4gICAgZXhwb3J0IGNsYXNzIEFuaW1hdGlvblNjYWxlIGV4dGVuZHMgQW5pbWF0aW9uQmFzZSBpbXBsZW1lbnRzIElBbmltYXRpb24ge1xyXG4gICAgICAgIFRhcmdldFNjYWxlOiBudW1iZXI7XHJcblxyXG4gICAgICAgIGNvbnN0cnVjdG9yKGVudGl0eTogUElYSS5EaXNwbGF5T2JqZWN0LCBkdXJhdGlvbkluTXM6IG51bWJlciwgbmV3U2NhbGU6IG51bWJlciwgb25Db21wbGV0ZWQ6ICgpID0+IHZvaWQgPSBudWxsKSB7XHJcbiAgICAgICAgICAgIHN1cGVyKGVudGl0eSwgZHVyYXRpb25Jbk1zLCBvbkNvbXBsZXRlZCk7XHJcbiAgICAgICAgICAgIHRoaXMuVGFyZ2V0U2NhbGUgPSBuZXdTY2FsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFVwZGF0ZShlbGFwc2VkTXM6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5kdXJhdGlvblJlbWFpbnMgPiBlbGFwc2VkTXMpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkID0gKGVsYXBzZWRNcyAqICh0aGlzLlRhcmdldFNjYWxlIC0gdGhpcy5FbnRpdHkuc2NhbGUueCkpIC8gdGhpcy5kdXJhdGlvblJlbWFpbnM7XHJcbiAgICAgICAgICAgICAgICB0aGlzLkVudGl0eS5zY2FsZS54ICs9IGQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLkVudGl0eS5zY2FsZS55ICs9IGQ7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmR1cmF0aW9uUmVtYWlucyAtPSBlbGFwc2VkTXM7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAvLyBIZXJlIGlzIGZpbmFsIGNhbGxcclxuICAgICAgICAgICAgICAgIHRoaXMuRW50aXR5LnNjYWxlLnggPSB0aGlzLlRhcmdldFNjYWxlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5FbnRpdHkuc2NhbGUueSA9IHRoaXMuVGFyZ2V0U2NhbGU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLklzQ29tcGxldGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZHVyYXRpb25SZW1haW5zID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
