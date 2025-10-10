// lib/api/client/models/ForumChannelInfo.ts

/**
 * Information about a forum tag
 * Maps to Mewdeko.Controllers.Common.ClientOperations.ForumTagInfo
 */
export interface ForumTagInfo {
  /** The tag ID */
  id: bigint;

  /** The tag name */
  name: string;

  /** The tag emoji (if any) */
  emoji: string | null;

  /** Whether this tag is moderated */
  isModerated: boolean;
}

/**
 * Information about a forum thread
 * Maps to Mewdeko.Controllers.Common.ClientOperations.ThreadInfo
 */
export interface ThreadInfo {
  /** The thread ID */
  id: bigint;

  /** The thread name */
  name: string;

  /** Tags applied to this thread */
  appliedTags: bigint[];

  /** Thread creator ID */
  creatorId: bigint;

  /** When the thread was created */
  createdAt: string;

  /** Message count in the thread */
  messageCount: number;

  /** Whether the thread is archived */
  isArchived: boolean;

  /** Whether the thread is locked */
  isLocked: boolean;
}

/**
 * Detailed information about a forum channel
 * Maps to Mewdeko.Controllers.Common.ClientOperations.ForumChannelInfo
 */
export interface ForumChannelInfo {
  /** The forum channel ID */
  id: bigint;

  /** The forum channel name */
  name: string;

  /** The forum channel topic/description */
  topic: string | null;

  /** Available tags for this forum */
  tags: ForumTagInfo[];

  /** Active threads in this forum */
  activeThreads: ThreadInfo[];

  /** Total number of threads (active + archived) */
  totalThreadCount: number;

  /** Whether the forum requires tags */
  requiresTags: boolean;

  /** Maximum number of active threads */
  maxActiveThreads: number | null;

  /** Default auto archive duration for threads */
  defaultAutoArchiveDuration: number | null;
}
