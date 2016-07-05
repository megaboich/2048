// Helper static class for working with random
export class RandomHelper {
    // Returns a random integer between min (included) and max (included)
    // Using Math.round() will give you a non-uniform distribution!
    static GetRandomIntInclusive(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Returns a random integer between min (included) and max (excluded)
    // Using Math.round() will give you a non-uniform distribution!
    static GetRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min)) + min;
    }


    static GetRandColor(): number {
        var r = this.GetRandomInt(120, 255);
        var g = this.GetRandomInt(120, 255);
        var b = this.GetRandomInt(120, 255);
        return b + 256 * g + 256 * 256 * r;
    }
}

export interface IRandom {
    GetRandomNumber(max: number): number;
}

export class DefaultRandom implements IRandom {
    GetRandomNumber(max: number): number {
        return RandomHelper.GetRandomInt(0, max);
    }
}