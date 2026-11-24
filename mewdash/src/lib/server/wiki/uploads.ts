import { randomUUID } from "node:crypto";
import { query } from "$lib/server/db";
import { imageExtensions, uploadPrefix, type ImageType } from "$lib/wiki/images";

/**
 * Stores an uploaded image in the wiki database.
 *
 * @param data The image bytes, already checked for type and size.
 * @param type The type found by looking at the bytes.
 * @param uploader Who uploaded it.
 * @returns The address the image is served from.
 */
export async function storeImage(data: Buffer, type: ImageType, uploader: { id: string; name: string }): Promise<string> {
  const id = randomUUID();
  await query(
    "insert into dash_wiki_images (id, content_type, bytes, data, uploaded_by, uploaded_by_name) values ($1, $2, $3, $4, $5, $6)",
    [id, type, data.length, data, uploader.id, uploader.name],
  );
  return `${uploadPrefix}${id}.${imageExtensions[type]}`;
}

/** An uploaded image's type and bytes, or null when there is none with this id. */
export async function readImage(id: string): Promise<{ type: ImageType; data: Buffer } | null> {
  const result = await query<{ content_type: ImageType; data: Buffer }>("select content_type, data from dash_wiki_images where id = $1", [id]);
  const row = result.rows[0];
  return row ? { type: row.content_type, data: row.data } : null;
}
