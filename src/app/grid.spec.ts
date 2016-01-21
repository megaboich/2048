///<reference path="..\..\lib\typings\tsd.d.ts"/>

///<reference path="grid.ts"/>

describe("Grid tests", function(){
    
    it("Grid creation", function(){
        var g = new Grid(4);
        
        expect(g.size).toBe(4);
    });
    
});
