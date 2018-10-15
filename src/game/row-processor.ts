import { Tile } from "./tile";

export class TileUpdateEvent {
  constructor(
    public oldIndex: number,
    public newIndex: number,
    public value: number,
    public mergedValue: number = 0
  ) {}

  get isDeleted(): boolean {
    return this.mergedValue < 0;
  }

  get isMerged(): boolean {
    return this.mergedValue > 0;
  }
}

export class RowProcessor {
  static ProcessRow(tiles: Tile[]): TileUpdateEvent[] {
    let valueToMerge = tiles[0].value;
    let availableCellIndex = tiles[0].value > 0 ? 1 : 0;
    const resultEvents: TileUpdateEvent[] = [];
    let moveEventBeforeMerge: TileUpdateEvent | undefined = undefined;

    for (let ir = 1; ir < tiles.length; ++ir) {
      const current = tiles[ir].value;

      if (current == 0) {
        // Skip zeros
        continue;
      }

      if (valueToMerge != current) {
        if (ir > availableCellIndex) {
          // Move case
          moveEventBeforeMerge = new TileUpdateEvent(
            ir,
            availableCellIndex,
            current
          );
          resultEvents.push(moveEventBeforeMerge);
        }
        valueToMerge = current;
        ++availableCellIndex;
        continue;
      }

      // Merge case (accumulatedValue != current)
      // If we do merge after move then
      if (moveEventBeforeMerge) {
        moveEventBeforeMerge.mergedValue = -1;
      } else {
        // Fake move event just for deletion
        resultEvents.push(
          new TileUpdateEvent(
            availableCellIndex - 1,
            availableCellIndex - 1,
            current,
            -1
          )
        );
      }
      resultEvents.push(
        new TileUpdateEvent(
          ir,
          availableCellIndex - 1,
          current,
          current + valueToMerge
        )
      );

      valueToMerge = 0; // Don't allow all merges in one turn
    }

    return resultEvents;
  }
}
