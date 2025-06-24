declare module "colorthief" {
  export type RGBColor = [number, number, number]

  class ColorThief {
    getColor: (
      img: HTMLImageElement | null,
      quality: number = 10
    ) => RGBColor | null;

    getPalette: (
      img: HTMLImageElement | null,
      colorCount: number = 10,
      quality: number = 10
    ) => RGBColor[] | null;
  }
}