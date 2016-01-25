///<reference path="dtos.ts"/>

class RowProcessor {
    static ProcessRow(tiles: Tile[]): ProcessionEvent[] {
        var accumulatedValue = tiles[0].Value;
        var availableCellIndex = tiles[0].Value > 0 ? 1 : 0;
        var resultEvents = <ProcessionEvent[]>[];

        for (var ir = 1; ir < tiles.length; ++ir) {
            var current = tiles[ir].Value;

            if (current == 0) {
                // Skip zeros
                continue;
            }

            if (accumulatedValue != current) {
                if (ir > availableCellIndex) {
                    // Move case
                    resultEvents.push(new ProcessionEvent(ir, availableCellIndex, current));
                }
                accumulatedValue = current;
                ++availableCellIndex;
                continue;
            }

            // Merge case (accumulatedValue != current)
            resultEvents.push(new ProcessionEvent(ir, availableCellIndex - 1, current, current + accumulatedValue))
            accumulatedValue = 0;  // Don't allow all accumulations in one turn
        }

        return resultEvents;
    }
}