import { Tile } from './models'
import { RowProcessor } from './row-processor'
import { compareProcessionEvents } from './testing/compare-helper'
import { RowProcessionEvent } from './events'

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
        var expectedResult = <RowProcessionEvent[]>[];
        var actualResult = RowProcessor.ProcessRow(sourceData);
        compareProcessionEvents(actualResult, expectedResult);
    });

    it("Nothing moves 2", () => {
        var sourceData = buildTestTiles([2, 4, 8, 16]);
        var expectedResult = <RowProcessionEvent[]>[];
        var actualResult = RowProcessor.ProcessRow(sourceData);
        compareProcessionEvents(actualResult, expectedResult);
    });

    it("Single move", () => {
        var sourceData = buildTestTiles([0, 0, 0, 2]);
        var expectedResult = [new RowProcessionEvent(3, 0, 2)];
        var actualResult = RowProcessor.ProcessRow(sourceData);
        compareProcessionEvents(actualResult, expectedResult);
    });

    it("Stacked move", () => {
        var sourceData = buildTestTiles([0, 2, 0, 4]);
        var expectedResult = [new RowProcessionEvent(1, 0, 2), new RowProcessionEvent(3, 1, 4)];
        var actualResult = RowProcessor.ProcessRow(sourceData);
        compareProcessionEvents(actualResult, expectedResult);
    });

    it("Stacked move 2", () => {
        var sourceData = buildTestTiles([0, 2, 4, 8]);
        var expectedResult = [new RowProcessionEvent(1, 0, 2), new RowProcessionEvent(2, 1, 4), new RowProcessionEvent(3, 2, 8)];
        var actualResult = RowProcessor.ProcessRow(sourceData);
        compareProcessionEvents(actualResult, expectedResult);
    });

    it("Simple merge", () => {
        var sourceData = buildTestTiles([2, 2, 0, 0]);
        var expectedResult = [new RowProcessionEvent(0, 0, 2, -1), new RowProcessionEvent(1, 0, 2, 4)];
        var actualResult = RowProcessor.ProcessRow(sourceData);
        compareProcessionEvents(actualResult, expectedResult);
    });

    it("Merge with space", () => {
        var sourceData = buildTestTiles([2, 0, 2, 0]);
        var expectedResult = [new RowProcessionEvent(0, 0, 2, -1), new RowProcessionEvent(2, 0, 2, 4)];
        var actualResult = RowProcessor.ProcessRow(sourceData);
        compareProcessionEvents(actualResult, expectedResult);
    });

    it("Move with merge", () => {
        var sourceData = buildTestTiles([0, 0, 2, 2]);
        var expectedResult = [new RowProcessionEvent(2, 0, 2, -1), new RowProcessionEvent(3, 0, 2, 4)];
        var actualResult = RowProcessor.ProcessRow(sourceData);
        compareProcessionEvents(actualResult, expectedResult);
    });

    it("Move with merge with spaces", () => {
        var sourceData = buildTestTiles([0, 2, 0, 2]);
        var expectedResult = [new RowProcessionEvent(1, 0, 2, -1), new RowProcessionEvent(3, 0, 2, 4)];
        var actualResult = RowProcessor.ProcessRow(sourceData);
        compareProcessionEvents(actualResult, expectedResult);
    });

    it("Double merge", () => {
        var sourceData = buildTestTiles([2, 2, 2, 2]);
        var expectedResult = [new RowProcessionEvent(0, 0, 2, -1), new RowProcessionEvent(1, 0, 2, 4), new RowProcessionEvent(2, 1, 2, -1), new RowProcessionEvent(3, 1, 2, 4)];
        var actualResult = RowProcessor.ProcessRow(sourceData);
        compareProcessionEvents(actualResult, expectedResult);
    });
});
