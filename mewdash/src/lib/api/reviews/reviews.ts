// lib/api/reviews/reviews.ts
import { apiRequest } from "../core";
import type { BotReview } from "./models";

/**
 * Bot reviews API
 * Maps to Mewdeko.Controllers.ReviewsController
 */
export const reviewsApi = {
  /**
   * Gets all bot reviews
   * @returns Collection of bot reviews
   */
  getBotReviews: () => apiRequest<BotReview[]>("reviews"),

  /**
   * Submits a new bot review
   * @param review The review to submit
   * @returns The submitted review with its ID
   */
  submitBotReview: (review: Partial<BotReview>) =>
    apiRequest<BotReview>("reviews", "POST", review),

  /**
   * Deletes a bot review
   * @param id The review ID to delete
   */
  deleteReview: (id: number) => apiRequest<void>(`reviews/${id}`, "DELETE"),
};
