// lib/api/client/models/ChannelType.ts

/**
 * Used for getting a specific channel type in the API
 * Maps to Mewdeko.Controllers.Common.ClientOperations.ChannelType
 */
export enum ChannelType {
  /** Text channels */
  Text = "Text",

  /** Voice channels */
  Voice = "Voice",

  /** Category channels */
  Category = "Category",

  /** Announcement channels */
  Announcement = "Announcement",

  /** Forum channels */
  Forum = "Forum",

  /** None/All channels */
  None = "None",
}
