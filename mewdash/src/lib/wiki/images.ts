export type ImageType = "image/png" | "image/jpeg" | "image/gif" | "image/webp";

export const imageExtensions: Record<ImageType, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/webp": "webp",
};

/** Where uploaded wiki images are served from. */
export const uploadPrefix = "/cdn/wiki/";

/** Where images from other sites are served from after the server fetched them. */
export const proxyPrefix = "/cdn/wiki-image/";

const uploadFile = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.(png|jpg|webp|gif)$/;

/**
 * Names the type of an image from its first bytes. The type a client claims is never used.
 *
 * @param bytes The file content.
 * @returns The type, or null when the bytes are not a PNG, JPEG, GIF or WebP image.
 */
export function sniffImage(bytes: Uint8Array): ImageType | null {
  const at = (offset: number, ...values: number[]) => values.every((value, i) => bytes[offset + i] === value);
  if (bytes.length >= 8 && at(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "image/png";
  if (bytes.length >= 3 && at(0, 0xff, 0xd8, 0xff)) return "image/jpeg";
  if (bytes.length >= 6 && (at(0, 0x47, 0x49, 0x46, 0x38, 0x37, 0x61) || at(0, 0x47, 0x49, 0x46, 0x38, 0x39, 0x61))) return "image/gif";
  if (bytes.length >= 12 && at(0, 0x52, 0x49, 0x46, 0x46) && at(8, 0x57, 0x45, 0x42, 0x50)) return "image/webp";
  return null;
}

export const externalImageUrlMax = 2000;

/**
 * Checks an image address from an article that points at another site. Only plain https
 * addresses on the default port, without a user name or password, are accepted.
 *
 * @param src The address as it appears in the article.
 * @returns The normalised address, or null when the image must not be loaded.
 */
export function externalImageUrl(src: string): string | null {
  if (src.length > externalImageUrlMax || !/^https:\/\//i.test(src)) return null;
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port || !url.hostname) return null;
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return null;
  return url.href.length > externalImageUrlMax ? null : url.href;
}

/**
 * Reads the id out of an uploaded image's file name.
 *
 * @param file The last part of the address, such as `<id>.png`.
 * @returns The id and the type the extension names, or null for any other name.
 */
export function parseUploadFile(file: string): { id: string; type: ImageType } | null {
  const match = uploadFile.exec(file);
  if (!match) return null;
  const type = (Object.keys(imageExtensions) as ImageType[]).find((key) => imageExtensions[key] === match[2]);
  return type ? { id: match[1], type } : null;
}
