// Client-side auth refresh handler
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { userStore } from '$lib/stores/userStore';
import { get } from 'svelte/store';

let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let isRefreshing = false;

// Schedule a token refresh
export function scheduleTokenRefresh(intervalMs: number = 8 * 60 * 1000) { // 8 minutes
  if (!browser) return;
  
  // Clear any existing timer
  if (refreshTimer) {
    clearTimeout(refreshTimer);
  }
  
  // Schedule the refresh
  refreshTimer = setTimeout(async () => {
    await performTokenRefresh();
    // Schedule next refresh
    scheduleTokenRefresh();
  }, intervalMs);
}

// Perform token refresh
export async function performTokenRefresh(): Promise<boolean> {
  if (!browser || isRefreshing) return false;
  
  isRefreshing = true;
  
  try {
    const response = await fetch('/api/discord/refresh', {
      method: 'POST',
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.user) {
        userStore.set(data.user);
      }
      return true;
    } else {
      // If refresh failed, clear user store and redirect to login
      const currentUser = get(userStore);
      if (currentUser) {
        userStore.set(null);
        const currentPath = window.location.pathname + window.location.search;
        await goto(`/api/discord/login?redirect_to=${encodeURIComponent(currentPath)}`);
      }
      return false;
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    return false;
  } finally {
    isRefreshing = false;
  }
}

// Start auth refresh when user is logged in
export function initAuthRefresh() {
  if (!browser) return;
  
  const user = get(userStore);
  if (user) {
    scheduleTokenRefresh();
  }
  
  // Listen for user changes
  userStore.subscribe((user) => {
    if (user) {
      scheduleTokenRefresh();
    } else if (refreshTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = null;
    }
  });
}