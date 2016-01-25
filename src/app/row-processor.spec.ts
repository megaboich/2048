///<reference path="..\..\lib\typings\tsd.d.ts"/>

///<reference path="row-processor.ts"/>

describe("Row Processor tests", () => {

    function compare(actual: ProcessionEvent[], expected: ProcessionEvent[]): void {
        expect(actual.length).toEqual(expected.length, "Length of actual and expected events are not equal");
        for (var i = 0; i < actual.length; ++i) {
            var actualEvent = actual[i];
            var expectedEvent = expected[i];

            expect(actualEvent.NewIndex).toEqual(expectedEvent.NewIndex, "comparison of NewIndex property");
            expect(actualEvent.OldIndex).toEqual(expectedEvent.OldIndex, "comparison of OldIndex property");
            expect(actualEvent.MergedValue).toEqual(expectedEvent.MergedValue, "comparison of MergedValue property");
        }
    }

    it("Nothing moves", () => {
        var sourceData = [2, 0, 0, 0];
        var expectedResult = <ProcessionEvent[]>[];
        var actualResult = RowProcessor.ProcessRow(sourceData);
        compare(actualResult, expectedResult);
    });

    it("Nothing moves 2", () => {
        var sourceData = [2, 4, 8, 16];
        var expectedResult = <ProcessionEvent[]>[];
        var actualResult = RowProcessor.ProcessRow(sourceData);
        compare(actualResult, expectedResult);
    });

    it("Single move", () => {
        var sourceData = [0, 0, 0, 2];
        var expectedResult = [new ProcessionEvent(3, 0)];
        var actualResult = RowProcessor.ProcessRow(sourceData);
        compare(actualResult, expectedResult);
    });

    it("Stacked move", () => {
        var sourceData = [0, 2, 0, 4];
        var expectedResult = [new ProcessionEvent(1, 0), new ProcessionEvent(3, 1)];
        var actualResult = RowProcessor.ProcessRow(sourceData);
        compare(actualResult, expectedResult);
    });

    it("Stacked move 2", () => {
        var sourceData = [0, 2, 4, 8];
        var expectedResult = [new ProcessionEvent(1, 0), new ProcessionEvent(2, 1), new ProcessionEvent(3, 2)];
        var actualResult = RowProcessor.ProcessRow(sourceData);
        compare(actualResult, expectedResult);
    });

    it("Simple merge", () => {
        var sourceData = [2, 2, 0, 0];
        var expectedResult = [new ProcessionEvent(1, 0, 4)];
        var actualResult = RowProcessor.ProcessRow(sourceData);
        compare(actualResult, expectedResult);
    });

    it("Merge with space", () => {
        var sourceData = [2, 0, 2, 0];
        var expectedResult = [new ProcessionEvent(2, 0, 4)];
        var actualResult = RowProcessor.ProcessRow(sourceData);
        compare(actualResult, expectedResult);
    });

    it("Move with merge", () => {
        var sourceData = [0, 0, 2, 2];
        var expectedResult = [new ProcessionEvent(2, 0), new ProcessionEvent(3, 0, 4)];
        var actualResult = RowProcessor.ProcessRow(sourceData);
        compare(actualResult, expectedResult);
    });

    it("Move with merge with spaces", () => {
        var sourceData = [0, 2, 0, 2];
        var expectedResult = [new ProcessionEvent(1, 0), new ProcessionEvent(3, 0, 4)];
        var actualResult = RowProcessor.ProcessRow(sourceData);
        compare(actualResult, expectedResult);
    });

    it("Double merge", () => {
        var sourceData = [2, 2, 2, 2];
        var expectedResult = [new ProcessionEvent(1, 0, 4), new ProcessionEvent(2, 1), new ProcessionEvent(3, 1, 4)];
        var actualResult = RowProcessor.ProcessRow(sourceData);
        compare(actualResult, expectedResult);
    });
});
