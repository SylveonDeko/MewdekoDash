const MAX_SIDE = 1600;
const MAX_DATA_URL = 480 * 1024;

/**
 * Reads an image file as a data URL small enough for the dashboard's request limit, shrinking it in the browser first.
 * @param file The chosen image
 * @returns A data URL of at most about 480 KB
 */
export async function readImageForUpload(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    let side = MAX_SIDE;
    let quality = 0.9;
    for (;;) {
      const scale = Math.min(1, side / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const data = canvas.toDataURL("image/webp", quality);
      if (data.length <= MAX_DATA_URL || side <= 320) return data;
      if (quality > 0.6) quality -= 0.15;
      else side = Math.round(side * 0.75);
    }
  } finally {
    bitmap.close();
  }
}
