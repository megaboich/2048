///<reference path="..\..\lib\typings\tsd.d.ts"/>

///<reference path="dtos.ts"/>
    
function compareProcessionEvents(actual: ProcessionEvent[], expected: ProcessionEvent[]): void {
    expect(actual.length).toEqual(expected.length, "Length of actual and expected events are not equal");
    for (var i = 0; i < actual.length; ++i) {
        var actualEvent = actual[i];
        var expectedEvent = expected[i];

        expect(actualEvent.NewIndex).toEqual(expectedEvent.NewIndex, "comparison of NewIndex at index " + i);
        expect(actualEvent.OldIndex).toEqual(expectedEvent.OldIndex, "comparison of OldIndex at index " + i);
        expect(actualEvent.MergedValue).toEqual(expectedEvent.MergedValue, "comparison of MergedValue at index " + i);
        expect(actualEvent.OldValue).toEqual(expectedEvent.OldValue, "comparison of OldValue at index " + i);
    }
}

function compareTiles(actual: Tile[], expected: Tile[]): void {
    expect(actual.length).toEqual(expected.length, "Length of actual and expected events are not equal");
    for (var i = 0; i < actual.length; ++i) {
        var actualValue = actual[i];
        var expectedValue = expected[i];

        expect(actualValue.CellIndex).toEqual(expectedValue.CellIndex, "comparison of CellIndex at index " + i);
        expect(actualValue.RowIndex).toEqual(expectedValue.RowIndex, "comparison of RowIndex at index " + i);
        expect(actualValue.Value).toEqual(expectedValue.Value, "comparison of Value at index " + i);
    }
}