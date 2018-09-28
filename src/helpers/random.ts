// Helper static class for working with random
export class RandomHelper {
  // Returns a random integer between min (included) and max (included)
  // Using Math.round() will give you a non-uniform distribution!
  static getRandomIntInclusive(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Returns a random integer between min (included) and max (excluded)
  // Using Math.round() will give you a non-uniform distribution!
  static getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  static getRandColor(): number {
    const r = this.getRandomInt(120, 255);
    const g = this.getRandomInt(120, 255);
    const b = this.getRandomInt(120, 255);
    return b + 256 * g + 256 * 256 * r;
  }
}

export interface IRandom {
  getRandomNumber(max: number): number;
}

export class DefaultRandom implements IRandom {
  getRandomNumber(max: number): number {
    return RandomHelper.getRandomInt(0, max);
  }
}
