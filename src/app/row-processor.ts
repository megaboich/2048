class ProcessionEvent {
    OldIndex: number;
    NewIndex: number;
    IsMerged: boolean;
    MergedValue: number;

    constructor(oldIndex: number, newIndex: number, mergedValue: number = 0) {
        this.OldIndex = oldIndex;
        this.NewIndex = newIndex;
        this.MergedValue = mergedValue;
        this.IsMerged = (this.MergedValue > 0);
    }
}

class RowProcessor {
    static ProcessRow(values: number[]): ProcessionEvent[] {
        var accumulatedValue = values[0];
        var availableCellIndex = values[0] > 0 ? 1 : 0;
        var resultEvents = <ProcessionEvent[]>[];

        for (var ir = 1; ir < values.length; ++ir) {
            var current = values[ir];

            if (current == 0) {
                // Skip zeros
                continue;
            }

            if (accumulatedValue != current) {
                if (ir > availableCellIndex) {
                    // Move case
                    resultEvents.push(new ProcessionEvent(ir, availableCellIndex));
                }
                accumulatedValue = current;
                ++availableCellIndex;
                continue;
            }

            // Merge case (accumulatedValue != current)
            resultEvents.push(new ProcessionEvent(ir, availableCellIndex - 1, current + accumulatedValue))
            accumulatedValue = 0;  // Don't allow all accumulations in one turn
        }

        return resultEvents;
    }
}