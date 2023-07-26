const MINUTE = 60_000;
const YEAR = 31_556_952_000;

export function calculateAutorewind(lastPlay: number) {
    const updatedBefore = Date.now() - lastPlay;
        if (updatedBefore < 10_000) return 0
        else if (updatedBefore < 5 * MINUTE) return 2
        else if (updatedBefore < 30 * MINUTE) return 15
        else if (updatedBefore < YEAR) return 30
        else return 0
}

export function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}