// lib/api/ownership/ownership.ts
import { apiRequest } from "../core";

/**
 * Ownership check API
 * Maps to Mewdeko.Controllers.OwnershipController
 */
export const ownershipApi = {
  /**
   * Checks if a user is a bot owner
   * @param userId The Discord user ID to check
   * @returns Whether the user is a bot owner
   */
  isOwner: (userId: bigint) => apiRequest<boolean>(`Ownership/${userId}`),
};
