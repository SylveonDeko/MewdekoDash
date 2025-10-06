// lib/stores/sseManager.ts
// Singleton manager for SSE connections to avoid duplicate subscriptions

class SSEManager {
  private connections: Map<string, EventSource> = new Map();
  private listeners: Map<string, Set<(event: any) => void>> = new Map();

  subscribe(guildId: string, callback: (event: any) => void) {
    const key = `guild:${guildId}`;

    // Add listener
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);

    // Create connection if it doesn't exist
    if (!this.connections.has(key)) {
      this.createConnection(guildId);
    }

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        listeners.delete(callback);

        // If no more listeners, close the connection
        if (listeners.size === 0) {
          this.closeConnection(guildId);
        }
      }
    };
  }

  // Clean up all connections (for app teardown)
  destroy() {
    this.connections.forEach((eventSource, key) => {
      eventSource.close();
    });
    this.connections.clear();
    this.listeners.clear();
  }

  private createConnection(guildId: string) {
    const key = `guild:${guildId}`;

    // Clean up any existing connection
    this.closeConnection(guildId);

    const url = `/api/music/events?guildId=${guildId}`;

    try {
      const eventSource = new EventSource(url);
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Notify all listeners for this guild
          const listeners = this.listeners.get(key);
          if (listeners) {
            listeners.forEach((callback) => {
              try {
                callback(data);
              } catch (err) {
              }
            });
          }
        } catch (err) {
        }
      };

      eventSource.onerror = (err) => {

        // Reconnect after 5 seconds if there are still listeners
        const listeners = this.listeners.get(key);
        if (listeners && listeners.size > 0) {
          setTimeout(() => {
            if (this.listeners.get(key)?.size) {
              this.createConnection(guildId);
            }
          }, 5000);
        }
      };

      this.connections.set(key, eventSource);
    } catch (err) {

    }
  }

  private closeConnection(guildId: string) {
    const key = `guild:${guildId}`;
    const eventSource = this.connections.get(key);

    if (eventSource) {
      eventSource.close();
      this.connections.delete(key);
    }
  }
}

// Export singleton instance
export const sseManager = new SSEManager();
