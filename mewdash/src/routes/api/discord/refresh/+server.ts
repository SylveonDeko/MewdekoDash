import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getOrRefreshToken } from "$lib/server/discordApi";

export const POST: RequestHandler = async (event) => {
  try {
    // Get current tokens from cookies - pass the full event object
    const accessToken = await getOrRefreshToken(event, event.cookies);

    if (!accessToken) {
      // If no access token and refresh failed, return error
      return json(
        { success: false, error: "No valid tokens" },
        { status: 401 },
      );
    }

    // If we got here, tokens are valid or were successfully refreshed
    // Return success with user data if available
    return json({
      success: true,
      user: event.locals.user,
      message: "Tokens are valid",
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 401 },
    );
  }
};