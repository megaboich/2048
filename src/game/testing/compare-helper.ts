import { RowProcessionEvent } from "../events";
import { Tile } from "../tile";

export function compareProcessionEvents(
  actual: RowProcessionEvent[],
  expected: RowProcessionEvent[]
): void {
  expect(actual.length).toEqual(
    expected.length,
    "Length of actual and expected events are not equal"
  );
  for (let i = 0; i < actual.length; ++i) {
    const actualEvent = actual[i];
    const expectedEvent = expected[i];

    expect(actualEvent.newIndex).toEqual(
      expectedEvent.newIndex,
      "comparison of NewIndex at index " + i
    );
    expect(actualEvent.oldIndex).toEqual(
      expectedEvent.oldIndex,
      "comparison of OldIndex at index " + i
    );
    expect(actualEvent.mergedValue).toEqual(
      expectedEvent.mergedValue,
      "comparison of MergedValue at index " + i
    );
    expect(actualEvent.value).toEqual(
      expectedEvent.value,
      "comparison of OldValue at index " + i
    );
  }
}

export function compareTiles(actual: Tile[], expected: Tile[]): void {
  expect(actual.length).toEqual(
    expected.length,
    "Length of actual and expected events are not equal"
  );
  for (let i = 0; i < actual.length; ++i) {
    const actualValue = actual[i];
    const expectedValue = expected[i];

    expect(actualValue.cellIndex).toEqual(
      expectedValue.cellIndex,
      "comparison of CellIndex at index " + i
    );
    expect(actualValue.rowIndex).toEqual(
      expectedValue.rowIndex,
      "comparison of RowIndex at index " + i
    );
    expect(actualValue.value).toEqual(
      expectedValue.value,
      "comparison of Value at index " + i
    );
  }
}
