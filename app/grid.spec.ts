import { Grid } from './grid'
import { Tile } from './models'
import { Direction } from './enums'
import { compareTiles } from './testing/compare-helper'

describe('Grid state', () => {
    it("Empty grid serializaion", () => {
        var g = new Grid(2);
        expect(g.Serialize()).toBe('0,0|0,0');
    });

    it("Filled grid serializaion", () => {
        var g = new Grid(2);
        g.InsertTile(0, 0, 1);
        g.InsertTile(0, 1, 2);
        g.InsertTile(1, 0, 3);
        g.InsertTile(1, 1, 4);
        expect(g.Serialize()).toBe('1,2|3,4');
    });

    it("Grid deserializaion", () => {
        var g = Grid.Deserialize('1,2,3|4,5,6|7,8,9');
        expect(g.Serialize()).toBe('1,2,3|4,5,6|7,8,9');
    });
});

describe("Grid insert tests", () => {

    it("Grid creation", () => {
        var g = new Grid(4);
        expect(g.Size).toBe(4);
    });

    it("Grid after creation all is available", () => {
        var g = new Grid(3);
        var availableCells = g.AvailableCells();
        expect(availableCells.length).toBe(9);
    });

    it("Grid available cells", () => {
        var g = new Grid(2);
        g.InsertTile(0, 0, 2);
        expect(g.AvailableCells().length).toBe(3);
        g.InsertTile(0, 1, 2);
        expect(g.AvailableCells().length).toBe(2);
        g.InsertTile(1, 0, 2);
        expect(g.AvailableCells().length).toBe(1);
        g.InsertTile(1, 1, 2);
        expect(g.AvailableCells().length).toBe(0);
    });

    it("Grid insert wrong dimension", () => {
        var g = new Grid(3);
        expect(() => {
            g.InsertTile(-1, 0, 2);
        }).toThrow();

        expect(() => {
            g.InsertTile(1, -1, 2);
        }).toThrow();

        expect(() => {
            g.InsertTile(3, 1, 2);
        }).toThrow();

        expect(() => {
            g.InsertTile(1, 3, 2);
        }).toThrow();
    });

    it("Grid insert occupied", () => {
        var g = new Grid(3);
        g.InsertTile(0, 0, 2);

        expect(() => {
            g.InsertTile(0, 0, 2);
        }).toThrow();
    });
});

describe('Grid get data by direction', () => {
    it("Left", () => {
        var g = Grid.Deserialize('1,2|3,4');
        var rowData = g.GetRowDataByDirection(Direction.Left);

        var _1 = new Tile(0, 0, 1);
        var _2 = new Tile(0, 1, 2);
        var _3 = new Tile(1, 0, 3);
        var _4 = new Tile(1, 1, 4);

        compareTiles(rowData[0], [_1, _2]);
        compareTiles(rowData[1], [_3, _4]);
    });

    it("Right", () => {
        var g = Grid.Deserialize('1,2|3,4');
        var rowData = g.GetRowDataByDirection(Direction.Right);

        var _1 = new Tile(0, 0, 1);
        var _2 = new Tile(0, 1, 2);
        var _3 = new Tile(1, 0, 3);
        var _4 = new Tile(1, 1, 4);

        compareTiles(rowData[0], [_2, _1]);
        compareTiles(rowData[1], [_4, _3]);
    });

    it("Up", () => {
        var g = Grid.Deserialize('1,2|3,4');
        var rowData = g.GetRowDataByDirection(Direction.Up);

        var _1 = new Tile(0, 0, 1);
        var _2 = new Tile(0, 1, 2);
        var _3 = new Tile(1, 0, 3);
        var _4 = new Tile(1, 1, 4);

        compareTiles(rowData[0], [_1, _3]);
        compareTiles(rowData[1], [_2, _4]);
    });

    it("Down", () => {
        var g = Grid.Deserialize('1,2|3,4');
        var rowData = g.GetRowDataByDirection(Direction.Down);

        var _1 = new Tile(0, 0, 1);
        var _2 = new Tile(0, 1, 2);
        var _3 = new Tile(1, 0, 3);
        var _4 = new Tile(1, 1, 4);

        compareTiles(rowData[0], [_3, _1]);
        compareTiles(rowData[1], [_4, _2]);
    });
});