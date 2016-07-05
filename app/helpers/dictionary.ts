
export interface IDictionary<TKey, TValue> {
    Add(key: TKey, value: TValue): void;
    Remove(key: TKey): void;
    ContainsKey(key: TKey): boolean;
    Keys(): TKey[];
    Values(): TValue[];
}

export class Dictionary<TKey, TValue> implements IDictionary<TKey, TValue> {

    private _keys: TKey[] = [];
    private _values: TValue[] = [];

    constructor(init: { Key: TKey; Value: TValue; }[]) {
        for (var x = 0; x < init.length; x++) {
            this.Add(init[x].Key, init[x].Value);
        }
    }

    Add(key: TKey, value: TValue): void {
        if (this[key.toString()] !== undefined) {
            throw `Item with key ${key} has been already added to dictionary`;
        }

        this[key.toString()] = value;
        this._keys.push(key);
        this._values.push(value);
    }

    Remove(key: TKey): void {
        var index = this._keys.indexOf(key, 0);
        this._keys.splice(index, 1);
        this._values.splice(index, 1);

        delete this[key.toString()];
    }

    Keys(): TKey[] {
        return this._keys;
    }

    Values(): TValue[] {
        return this._values;
    }

    ContainsKey(key: TKey) {
        if (typeof this[key.toString()] === "undefined") {
            return false;
        }

        return true;
    }

    Get(key: TKey): TValue {
        var val = this[key.toString()];
        if (val !== undefined) {
            return <TValue>val;
        }
        throw `Key ${key} is not found in dictionary`;
    }
}
