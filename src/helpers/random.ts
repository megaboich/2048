// Helper static class for working with random
export class RandomHelper {
  /**
   * Returns a random integer between min (included) and max (excluded)
   * Using Math.round() will give you a non-uniform distribution!
   */
  static getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
  }
}

export interface IRandom {
  getRandomNumber(min: number, max: number): number;
}

export class DefaultRandom implements IRandom {
  getRandomNumber(min: number, max: number): number {
    return RandomHelper.getRandomInt(min, max);
  }
}
