///<reference path="..\lib\typings\jasmine\jasmine.d.ts"/>

///<reference path="..\mechanics\grid.ts"/>

describe("Grid tests", function(){
    
    it("Grid creation", function(){
        var g = new Grid(4);
        
        expect(g.size).toBe(4);
    });
    
})