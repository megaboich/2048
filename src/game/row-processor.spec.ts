import { Tile } from "./tile";
import { RowProcessor, TileUpdateEvent } from "./row-processor";

describe("Row Processor tests", () => {
  function buildTestTiles(values: number[]): Tile[] {
    const result = <Tile[]>[];
    for (let i = 0; i < values.length; ++i) {
      result.push({ rowIndex: i, cellIndex: 0, value: values[i] });
    }
    return result;
  }

  it("Nothing moves", () => {
    const sourceData = buildTestTiles([2, 0, 0, 0]);
    const expectedResult: TileUpdateEvent[] = [];
    const actualResult = RowProcessor.ProcessRow(sourceData);
    expect(actualResult).toEqual(expectedResult);
  });

  it("Nothing moves 2", () => {
    const sourceData = buildTestTiles([2, 4, 8, 16]);
    const expectedResult: TileUpdateEvent[] = [];
    const actualResult = RowProcessor.ProcessRow(sourceData);
    expect(actualResult).toEqual(expectedResult);
  });

  it("Single move", () => {
    const sourceData = buildTestTiles([0, 0, 0, 2]);
    const expectedResult = [new TileUpdateEvent(3, 0, 2)];
    const actualResult = RowProcessor.ProcessRow(sourceData);
    expect(actualResult).toEqual(expectedResult);
  });

  it("Stacked move", () => {
    const sourceData = buildTestTiles([0, 2, 0, 4]);
    const expectedResult = [
      new TileUpdateEvent(1, 0, 2),
      new TileUpdateEvent(3, 1, 4)
    ];
    const actualResult = RowProcessor.ProcessRow(sourceData);
    expect(actualResult).toEqual(expectedResult);
  });

  it("Stacked move 2", () => {
    const sourceData = buildTestTiles([0, 2, 4, 8]);
    const expectedResult = [
      new TileUpdateEvent(1, 0, 2),
      new TileUpdateEvent(2, 1, 4),
      new TileUpdateEvent(3, 2, 8)
    ];
    const actualResult = RowProcessor.ProcessRow(sourceData);
    expect(actualResult).toEqual(expectedResult);
  });

  it("Simple merge", () => {
    const sourceData = buildTestTiles([2, 2, 0, 0]);
    const expectedResult = [
      new TileUpdateEvent(0, 0, 2, -1),
      new TileUpdateEvent(1, 0, 2, 4)
    ];
    const actualResult = RowProcessor.ProcessRow(sourceData);
    expect(actualResult).toEqual(expectedResult);
  });

  it("Merge with space", () => {
    const sourceData = buildTestTiles([2, 0, 2, 0]);
    const expectedResult = [
      new TileUpdateEvent(0, 0, 2, -1),
      new TileUpdateEvent(2, 0, 2, 4)
    ];
    const actualResult = RowProcessor.ProcessRow(sourceData);
    expect(actualResult).toEqual(expectedResult);
  });

  it("Move with merge", () => {
    const sourceData = buildTestTiles([0, 0, 2, 2]);
    const expectedResult = [
      new TileUpdateEvent(2, 0, 2, -1),
      new TileUpdateEvent(3, 0, 2, 4)
    ];
    const actualResult = RowProcessor.ProcessRow(sourceData);
    expect(actualResult).toEqual(expectedResult);
  });

  it("Move with merge with spaces", () => {
    const sourceData = buildTestTiles([0, 2, 0, 2]);
    const expectedResult = [
      new TileUpdateEvent(1, 0, 2, -1),
      new TileUpdateEvent(3, 0, 2, 4)
    ];
    const actualResult = RowProcessor.ProcessRow(sourceData);
    expect(actualResult).toEqual(expectedResult);
  });

  it("Double merge", () => {
    const sourceData = buildTestTiles([2, 2, 2, 2]);
    const expectedResult = [
      new TileUpdateEvent(0, 0, 2, -1),
      new TileUpdateEvent(1, 0, 2, 4),
      new TileUpdateEvent(2, 1, 2, -1),
      new TileUpdateEvent(3, 1, 2, 4)
    ];
    const actualResult = RowProcessor.ProcessRow(sourceData);
    expect(actualResult).toEqual(expectedResult);
  });
});
