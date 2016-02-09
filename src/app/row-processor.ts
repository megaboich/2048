///<reference path="dtos.ts"/>

class RowProcessor {
    static ProcessRow(tiles: Tile[]): RowProcessionEvent[] {
        var valueToMerge = tiles[0].Value;
        var availableCellIndex = tiles[0].Value > 0 ? 1 : 0;
        var resultEvents = <RowProcessionEvent[]>[];
        var moveEventBeforeMerge: RowProcessionEvent = null;

        for (var ir = 1; ir < tiles.length; ++ir) {
            var current = tiles[ir].Value;

            if (current == 0) {
                // Skip zeros
                continue;
            }

            if (valueToMerge != current) {
                if (ir > availableCellIndex) {
                    // Move case
                    moveEventBeforeMerge = new RowProcessionEvent(ir, availableCellIndex, current);
                    resultEvents.push(moveEventBeforeMerge);
                }
                valueToMerge = current;
                ++availableCellIndex;
                continue;
            }
            
            // Merge case (accumulatedValue != current)
            // If we do merge after move then
            if (moveEventBeforeMerge != null) {
                moveEventBeforeMerge.MergedValue = -1;
            } else {
                // Fake move event just for deletion 
                resultEvents.push(new RowProcessionEvent(availableCellIndex - 1, availableCellIndex - 1, current, -1));
            }
            resultEvents.push(new RowProcessionEvent(ir, availableCellIndex - 1, current, current + valueToMerge));

            valueToMerge = 0;  // Don't allow all merges in one turn
        }

        return resultEvents;
    }
}