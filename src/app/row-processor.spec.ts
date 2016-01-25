///<reference path="common.spec.ts"/>
///<reference path="row-processor.ts"/>

describe("Row Processor tests", () => {

    function buildTestTiles(values: number[]): Tile[] {
        var result = <Tile[]>[];
        for (var i = 0; i < values.length; ++i) {
            result.push(new Tile(i, 0, values[i]));
        }
        return result;
    }

    it("Nothing moves", () => {
        var sourceData = buildTestTiles([2, 0, 0, 0]);
        var expectedResult = <ProcessionEvent[]>[];
        var actualResult = RowProcessor.ProcessRow(sourceData);
        compareProcessionEvents(actualResult, expectedResult);
    });

    it("Nothing moves 2", () => {
        var sourceData = buildTestTiles([2, 4, 8, 16]);
        var expectedResult = <ProcessionEvent[]>[];
        var actualResult = RowProcessor.ProcessRow(sourceData);
        compareProcessionEvents(actualResult, expectedResult);
    });

    it("Single move", () => {
        var sourceData = buildTestTiles([0, 0, 0, 2]);
        var expectedResult = [new ProcessionEvent(3, 0, 2)];
        var actualResult = RowProcessor.ProcessRow(sourceData);
        compareProcessionEvents(actualResult, expectedResult);
    });

    it("Stacked move", () => {
        var sourceData = buildTestTiles([0, 2, 0, 4]);
        var expectedResult = [new ProcessionEvent(1, 0, 2), new ProcessionEvent(3, 1, 4)];
        var actualResult = RowProcessor.ProcessRow(sourceData);
        compareProcessionEvents(actualResult, expectedResult);
    });

    it("Stacked move 2", () => {
        var sourceData = buildTestTiles([0, 2, 4, 8]);
        var expectedResult = [new ProcessionEvent(1, 0, 2), new ProcessionEvent(2, 1, 4), new ProcessionEvent(3, 2, 8)];
        var actualResult = RowProcessor.ProcessRow(sourceData);
        compareProcessionEvents(actualResult, expectedResult);
    });

    it("Simple merge", () => {
        var sourceData = buildTestTiles([2, 2, 0, 0]);
        var expectedResult = [new ProcessionEvent(1, 0, 2, 4)];
        var actualResult = RowProcessor.ProcessRow(sourceData);
        compareProcessionEvents(actualResult, expectedResult);
    });

    it("Merge with space", () => {
        var sourceData = buildTestTiles([2, 0, 2, 0]);
        var expectedResult = [new ProcessionEvent(2, 0, 2, 4)];
        var actualResult = RowProcessor.ProcessRow(sourceData);
        compareProcessionEvents(actualResult, expectedResult);
    });

    it("Move with merge", () => {
        var sourceData = buildTestTiles([0, 0, 2, 2]);
        var expectedResult = [new ProcessionEvent(2, 0, 2), new ProcessionEvent(3, 0, 2, 4)];
        var actualResult = RowProcessor.ProcessRow(sourceData);
        compareProcessionEvents(actualResult, expectedResult);
    });

    it("Move with merge with spaces", () => {
        var sourceData = buildTestTiles([0, 2, 0, 2]);
        var expectedResult = [new ProcessionEvent(1, 0, 2), new ProcessionEvent(3, 0, 2, 4)];
        var actualResult = RowProcessor.ProcessRow(sourceData);
        compareProcessionEvents(actualResult, expectedResult);
    });

    it("Double merge", () => {
        var sourceData = buildTestTiles([2, 2, 2, 2]);
        var expectedResult = [new ProcessionEvent(1, 0, 2, 4), new ProcessionEvent(2, 1, 2), new ProcessionEvent(3, 1, 2, 4)];
        var actualResult = RowProcessor.ProcessRow(sourceData);
        compareProcessionEvents(actualResult, expectedResult);
    });
});
