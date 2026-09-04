// lib/stores/searchStore.ts
import { writable } from 'svelte/store';
import { allDashboardFeatures, type NavigationItem } from '$lib/config/navigationItems';
import dashboardTabIndex from '$lib/config/dashboardTabIndex.json';

export interface SearchableItem {
  id: string;
  title: string;
  description: string;
  type: 'tab' | 'feature' | 'page' | 'setting';
  path: string;
  tab?: string;
  /** Complete Font Awesome class string, rendered as written. */
  icon: string;
  keywords: string[];
  category: string;
  ownerOnly?: boolean;
}

// Dynamic search registry
let dynamicSearchRegistry: SearchableItem[] = [];

const dashboardTabs: SearchableItem[] = [
  {
    id: 'overview-tab',
    title: 'Overview',
    description: 'Server stats and bot status',
    type: 'tab',
    path: '/dashboard?tab=overview',
    icon: 'fa-utility-duo fa-regular fa-house',
    keywords: ['overview', 'dashboard', 'stats', 'home', 'main'],
    category: 'Navigation'
  },
  {
    id: 'community-tab',
    title: 'Community',
    description: 'XP, suggestions, tickets, birthdays',
    type: 'tab',
    path: '/dashboard?tab=community',
    icon: 'fa-utility-duo fa-regular fa-users',
    keywords: ['community', 'users', 'xp', 'experience', 'suggestions', 'tickets'],
    category: 'Navigation'
  },
  {
    id: 'entertainment-tab',
    title: 'Entertainment',
    description: 'Music, voice, giveaways',
    type: 'tab',
    path: '/dashboard?tab=entertainment',
    icon: 'fa-utility-duo fa-regular fa-music',
    keywords: ['entertainment', 'music', 'voice', 'giveaways', 'fun'],
    category: 'Navigation'
  },
  {
    id: 'actions-tab',
    title: 'Actions',
    description: 'Greets, triggers, embeds',
    type: 'tab',
    path: '/dashboard?tab=actions',
    icon: 'fa-utility-duo fa-regular fa-bolt',
    keywords: ['actions', 'automation', 'triggers', 'greets', 'embeds'],
    category: 'Navigation'
  },
  {
    id: 'security-tab',
    title: 'Security',
    description: 'Moderation and protection',
    type: 'tab',
    path: '/dashboard?tab=security',
    icon: 'fa-utility-duo fa-regular fa-shield',
    keywords: ['security', 'moderation', 'protection', 'safety', 'admin'],
    category: 'Navigation'
  },
  {
    id: 'settings-tab',
    title: 'Settings',
    description: 'Bot config and roles',
    type: 'tab',
    path: '/dashboard?tab=settings',
    icon: 'fa-utility-duo fa-regular fa-cog',
    keywords: ['settings', 'config', 'configuration', 'roles', 'setup'],
    category: 'Navigation'
  },
];

/**
 * The one matcher both the command palette and the sidebar filter run, so a term
 * that finds a feature in one always finds it in the other.
 */
export function matchesSearchTerms(
  fields: { title: string; description?: string; category?: string; keywords?: string[] },
  query: string
): boolean {
  const term = query.trim().toLowerCase();
  if (!term) return true;

  return (
    fields.title.toLowerCase().includes(term) ||
    (fields.description?.toLowerCase().includes(term) ?? false) ||
    (fields.category?.toLowerCase().includes(term) ?? false) ||
    (fields.keywords ?? []).some(keyword => keyword.toLowerCase().includes(term))
  );
}

/** Which main dashboard tab each feature category sits under. */
const tabForCategory: Record<string, string> = {
  Community: 'community',
  Entertainment: 'entertainment',
  Actions: 'actions',
  Security: 'security',
  Analytics: 'overview',
  Settings: 'settings',
};

/**
 * Builds a search entry from a navigation item, keeping navigationItems.ts as the
 * single source of truth so a feature added to the nav is findable immediately.
 */
function toSearchableItem(item: NavigationItem): SearchableItem {
  const slug = item.href.replace(/^\/dashboard\/?/, '') || 'home';

  return {
    id: `feature-${slug}`,
    title: item.label,
    description: item.description ?? '',
    type: 'feature',
    path: item.href,
    tab: tabForCategory[item.category],
    icon: item.icon,
    keywords: [item.label.toLowerCase(), ...(item.keywords ?? [])],
    category: item.category,
    ownerOnly: item.ownerOnly,
  };
}

const featureSearchItems: SearchableItem[] = allDashboardFeatures.map(toSearchableItem);

interface IndexedTab {
  id: string;
  label: string;
  icon: string;
}

/**
 * Tabs extracted from the dashboard pages at build time by generate-tab-index.js, so
 * a setting inside a page is findable before that page has ever been opened. Live
 * registrations from DashboardPageLayout replace these by id once a page mounts.
 */
const pageTabSearchItems: SearchableItem[] = Object.entries(
  dashboardTabIndex as Record<string, { tabs: IndexedTab[]; subTabs?: IndexedTab[] }>
).flatMap(([basePath, entry]) => {
  const feature = allDashboardFeatures.find(item => item.href === basePath);
  if (!feature) return [];

  return [...entry.tabs, ...(entry.subTabs ?? [])].map(tab => ({
    id: `${basePath}-${tab.id}`,
    title: tab.label,
    description: `${tab.label} in ${feature.label}`,
    type: 'setting' as const,
    path: `${basePath}#${tab.id}`,
    tab: tabForCategory[feature.category],
    icon: `fa-solid ${tab.icon}`,
    keywords: [tab.label.toLowerCase(), feature.label.toLowerCase(), ...(feature.keywords ?? [])],
    category: feature.category,
    ownerOnly: feature.ownerOnly,
  }));
});

// Registration functions for dynamic features
export function registerSearchFeatures(features: SearchableItem[]) {
  // Remove existing features from the same page/component
  const featureIds = features.map(f => f.id);
  dynamicSearchRegistry = dynamicSearchRegistry.filter(f => !featureIds.includes(f.id));

  // Add new features
  dynamicSearchRegistry.push(...features);
}

export function unregisterSearchFeatures(featureIds: string[]) {
  dynamicSearchRegistry = dynamicSearchRegistry.filter(f => !featureIds.includes(f.id));
}

// Helper to register features from DashboardPageLayout tabs
export function registerTabFeatures(
  tabs: Array<{id: string, label: string, icon: any}>,
  subTabs: Array<{id: string, label: string, icon?: any, parentTab: string}>,
  basePath: string,
  pageTitle: string,
  category: string = 'Settings'
) {
  const features: SearchableItem[] = [];
  const ownerOnly = allDashboardFeatures.find(f => f.href === basePath)?.ownerOnly;

  // Register main tabs as features
  tabs.forEach(tab => {
    features.push({
      id: `${basePath}-${tab.id}`,
      title: tab.label,
      description: `${tab.label} settings for ${pageTitle}`,
      type: 'setting',
      path: `${basePath}#${tab.id}`,
      tab: category.toLowerCase(),
      icon: `fa-solid ${tab.icon}`,
      keywords: [tab.label.toLowerCase(), pageTitle.toLowerCase()],
      category,
      ownerOnly
    });
  });

  // Register sub-tabs as features
  subTabs.forEach(subTab => {
    const parentTab = tabs.find(t => t.id === subTab.parentTab);
    features.push({
      id: `${basePath}-${subTab.id}`,
      title: subTab.label,
      description: `${subTab.label} in ${parentTab?.label || 'settings'}`,
      type: 'setting',
      path: `${basePath}#${subTab.id}`,
      tab: category.toLowerCase(),
      icon: `fa-solid ${subTab.icon || parentTab?.icon}`,
      keywords: [subTab.label.toLowerCase(), parentTab?.label.toLowerCase() || '', pageTitle.toLowerCase()].filter(Boolean),
      category,
      ownerOnly
    });
  });

  registerSearchFeatures(features);
}

/**
 * Dashboard tabs, every feature from the nav, and any page tabs registered so far
 * this session, minus owner-only entries the viewer is not allowed to see.
 */
export function getSearchableFeatures(isOwner: boolean = false): SearchableItem[] {
  const byId = new Map<string, SearchableItem>();

  for (const item of [...dashboardTabs, ...featureSearchItems, ...pageTabSearchItems, ...dynamicSearchRegistry]) {
    byId.set(item.id, item);
  }

  return [...byId.values()].filter(item => !item.ownerOnly || isOwner);
}

// Search store
export const searchStore = writable({
  isOpen: false,
  query: '',
  results: [],
  selectedIndex: 0,
  recentSearches: []
});

// Track search state to prevent duplicates
let isSearchOpen = false;

// Subscribe to store changes to track state
searchStore.subscribe(value => {
  isSearchOpen = value.isOpen;
});

// Search functions
export function openSearch(initialQuery: string = '') {
  if (!isSearchOpen) {
    searchStore.update(state => ({ ...state, isOpen: true, query: initialQuery, selectedIndex: 0 }));
  }
}

export function toggleSearch() {
  if (isSearchOpen) {
    closeSearch();
  } else {
    openSearch();
  }
}

export function closeSearch() {
  searchStore.update(state => ({ ...state, isOpen: false, query: '', results: [], selectedIndex: 0 }));
}

export function updateQuery(query: string) {
  searchStore.update(state => ({ ...state, query, selectedIndex: 0 }));
}

// Global keyboard handler - only initialize once
if (typeof window !== 'undefined') {
  let keyboardInitialized = false;

  function initializeKeyboardHandlers() {
    if (keyboardInitialized) return;
    keyboardInitialized = true;

    window.addEventListener('keydown', (event: KeyboardEvent) => {
      // Cmd/Ctrl + K to toggle search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        // Don't trigger if an input is focused (except if search is open)
        if (!isInputFocused() || isSearchOpen) {
          event.preventDefault();
          toggleSearch();
        }
      }

      // Escape to close search (handled in SearchModal for better control)
    });
  }

  // Initialize on first import
  initializeKeyboardHandlers();
}

function isInputFocused(): boolean {
  if (typeof document === 'undefined') return false;

  const activeElement = document.activeElement;
  if (!activeElement) return false;

  const tagName = activeElement.tagName.toLowerCase();
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    activeElement.hasAttribute('contenteditable')
  );
}
