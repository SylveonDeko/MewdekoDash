// lib/api/embeds/models/EmbedImage.ts

/**
 * Request body for uploading a picture to use in a message.
 * Maps to Mewdeko.Controllers.Common.Embeds.UploadEmbedImageRequest
 */
export interface UploadEmbedImageRequest {
  /** The picture as a data URI or raw base64. */
  data: string;
}

/**
 * The stored picture.
 * Maps to Mewdeko.Controllers.Common.Embeds.EmbedImageResponse
 */
export interface EmbedImage {
  /** The public address of the picture. */
  url: string;
}
