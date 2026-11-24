/** Shapes the manage area and its endpoints exchange. Row ids are decimal strings. */

export interface ManagePage {
  id: string;
  slug: string;
  icon: string;
  category: string;
  dashboardHref: string | null;
  module: string | null;
  related: string[];
  published: boolean;
  title: string;
  localeCount: number;
  openSuggestions: number;
  updatedAt: string;
}

export interface VersionRecord {
  pageId: string;
  locale: string;
  title: string;
  summary: string;
  markdown: string;
  tags: string[];
  currentRevisionId: string | null;
  updatedAt: string;
  updatedByName: string;
}

export interface RevisionSummary {
  id: string;
  pageId: string;
  locale: string;
  title: string;
  note: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface RevisionRecord extends RevisionSummary {
  summary: string;
  markdown: string;
  tags: string[];
}

export interface RecentChange extends RevisionSummary {
  slug: string;
  pageTitle: string;
}

export type SuggestionStatus = "open" | "approved" | "declined" | "replaced";

export interface SuggestionRecord {
  id: string;
  pageId: string;
  slug: string;
  pageTitle: string;
  locale: string;
  baseRevisionId: string | null;
  title: string;
  summary: string;
  markdown: string;
  tags: string[];
  note: string;
  userId: string;
  userName: string;
  status: SuggestionStatus;
  declineReason: string;
  createdAt: string;
  reviewedAt: string | null;
  reviewedByName: string | null;
  current: { title: string; summary: string; markdown: string; tags: string[]; revisionId: string | null } | null;
}

export interface FeedbackRecord {
  id: string;
  pageId: string;
  slug: string;
  pageTitle: string;
  locale: string;
  helpful: boolean;
  reason: string;
  note: string;
  userId: string;
  status: "open" | "resolved" | "dismissed";
  createdAt: string;
  resolvedAt: string | null;
}

export interface EditorRecord {
  userId: string;
  displayName: string;
  addedBy: string;
  addedAt: string;
}

export interface BlockedUserRecord {
  userId: string;
  displayName: string;
  addedBy: string;
  addedAt: string;
}

export interface CategoryRecord {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
  pageCount: number;
}

export interface LanguageRow {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  locales: string[];
  outdated: string[];
}

export interface AnalyticsItem {
  pageId: string;
  slug: string;
  title: string;
  category: string;
  views: number;
  helpful: number;
  notHelpful: number;
  openReports: number;
}

export interface AnalyticsOverview {
  days: number;
  views: number;
  helpful: number;
  notHelpful: number;
  reports: number;
  daily: Array<{ day: string; views: number }>;
  items: AnalyticsItem[];
  misses: Array<{ query: string; count: number }>;
}

export interface PublicRevision {
  id: string;
  locale: string;
  title: string;
  note: string;
  authorName: string;
  createdAt: string;
}
