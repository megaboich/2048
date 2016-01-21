///<reference path="..\..\lib\typings\tsd.d.ts"/>

///<reference path="grid.ts"/>

describe("Grid tests", () => {

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
