// lib/api/reviews/models/BotReview.ts

/**
 * Bot review model
 * Maps to DataModel.BotReview from Database/L2DB/BotReview.cs
 */
export interface BotReview {
  /** Primary key */
  id: number;

  /** User ID who wrote the review */
  userId: bigint;

  /** User's avatar URL */
  avatarUrl: string;

  /** Star rating (1-5) */
  stars: number;

  /** Review text */
  review: string;

  /** Date the review was added */
  dateAdded: string | null;

  /** Username of the reviewer */
  username: string;
}
