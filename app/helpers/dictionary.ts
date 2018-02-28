export interface IDictionary<TKey, TValue> {
  add(key: TKey, value: TValue): void;
  remove(key: TKey): void;
  containsKey(key: TKey): boolean;
  keys(): TKey[];
  values(): TValue[];
}

export class Dictionary<TKey, TValue> implements IDictionary<TKey, TValue> {
  private keysArray: TKey[] = [];
  private valuesArray: TValue[] = [];
  private storageObj: { [key: string]: TValue } = {};

  constructor(init: { Key: TKey; Value: TValue }[]) {
    for (const rec of init) {
      this.add(rec.Key, rec.Value);
    }
  }

  add(key: TKey, value: TValue): void {
    if (this.storageObj[key.toString()] !== undefined) {
      throw new Error(
        `Item with key ${key} has been already added to dictionary`
      );
    }

    this.storageObj[key.toString()] = value;
    this.keysArray.push(key);
    this.valuesArray.push(value);
  }

  remove(key: TKey): void {
    const index = this.keysArray.indexOf(key, 0);
    this.keysArray.splice(index, 1);
    this.valuesArray.splice(index, 1);

    delete this.storageObj[key.toString()];
  }

  keys(): TKey[] {
    return this.keysArray;
  }

  values(): TValue[] {
    return this.valuesArray;
  }

  containsKey(key: TKey) {
    if (typeof this.storageObj[key.toString()] === "undefined") {
      return false;
    }

    return true;
  }

  get(key: TKey): TValue {
    const val = this.storageObj[key.toString()];
    if (val !== undefined) {
      return <TValue>val;
    }
    throw new Error(`Key ${key} is not found in dictionary`);
  }
}
