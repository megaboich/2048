export const animationDelay =200;
export const cellSize = 70;

export type ColorDic = { [key: number]: string | undefined };
export const cellBgColors: ColorDic = {
  2: "#eee4da",
  4: "#ede0c8",
  8: "#f2b179",
  16: "#f59563",
  32: "#f67c5f",
  64: "#f65e3b",
  128: "#edcf72",
  256: "#edcc61",
  512: "#edc850",
  1024: "#edc53f",
  2048: "#edc22e"
};
export const fallbackCellBgColor = "#edc22e";

export const cellColors: ColorDic = {
  2: "#776e65",
  4: "#776e65"
};

export const falbackCellColor = "#f9f6f2";
