// lib/stores/searchStore.ts
import { writable } from 'svelte/store';

export interface SearchableItem {
  id: string;
  title: string;
  description: string;
  type: 'tab' | 'feature' | 'page' | 'setting';
  path: string;
  tab?: string;
  icon: string; // Font Awesome icon class name
  keywords: string[];
  category: string;
}

// Dynamic search registry
let dynamicSearchRegistry: SearchableItem[] = [];

// Base static features (main tabs and core features)
const staticSearchableFeatures: SearchableItem[] = [
  // Main Tabs
  {
    id: 'overview-tab',
    title: 'Overview',
    description: 'Server stats and bot status',
    type: 'tab',
    path: '/dashboard?tab=overview',
    icon: 'fa-home',
    keywords: ['overview', 'dashboard', 'stats', 'home', 'main'],
    category: 'Navigation'
  },
  {
    id: 'community-tab',
    title: 'Community',
    description: 'XP, suggestions, tickets, birthdays',
    type: 'tab',
    path: '/dashboard?tab=community',
    icon: 'fa-users',
    keywords: ['community', 'users', 'xp', 'experience', 'suggestions', 'tickets'],
    category: 'Navigation'
  },
  {
    id: 'entertainment-tab',
    title: 'Entertainment',
    description: 'Music, voice, giveaways',
    type: 'tab',
    path: '/dashboard?tab=entertainment',
    icon: 'fa-music',
    keywords: ['entertainment', 'music', 'voice', 'giveaways', 'fun'],
    category: 'Navigation'
  },
  {
    id: 'actions-tab',
    title: 'Actions',
    description: 'Greets, triggers, embeds',
    type: 'tab',
    path: '/dashboard?tab=actions',
    icon: 'fa-bolt',
    keywords: ['actions', 'automation', 'triggers', 'greets', 'embeds'],
    category: 'Navigation'
  },
  {
    id: 'security-tab',
    title: 'Security',
    description: 'Moderation and protection',
    type: 'tab',
    path: '/dashboard?tab=security',
    icon: 'fa-shield',
    keywords: ['security', 'moderation', 'protection', 'safety', 'admin'],
    category: 'Navigation'
  },
  {
    id: 'settings-tab',
    title: 'Settings',
    description: 'Bot config and roles',
    type: 'tab',
    path: '/dashboard?tab=settings',
    icon: 'fa-cog',
    keywords: ['settings', 'config', 'configuration', 'roles', 'setup'],
    category: 'Navigation'
  },

  // All Features (alphabetical)
  {
    id: 'administration',
    title: 'Administration',
    description: 'Server administration and roles',
    type: 'feature',
    path: '/dashboard/administration',
    tab: 'security',
    icon: 'fa-cog',
    keywords: ['admin', 'administration', 'protection', 'roles'],
    category: 'Security'
  },
  {
    id: 'afk-system',
    title: 'AFK System',
    description: 'Away status management',
    type: 'feature',
    path: '/dashboard/afk',
    tab: 'actions',
    icon: 'fa-moon',
    keywords: ['afk', 'away', 'status', 'idle'],
    category: 'Actions'
  },
  {
    id: 'birthdays',
    title: 'Birthdays',
    description: 'Celebrate member birthdays',
    type: 'feature',
    path: '/dashboard/birthday',
    tab: 'community',
    icon: 'fa-birthday-cake',
    keywords: ['birthday', 'birthdays', 'celebrate', 'anniversary'],
    category: 'Community'
  },
  {
    id: 'chat-saver',
    title: 'Chat Saver',
    description: 'Audit trails and message history',
    type: 'feature',
    path: '/dashboard/chatsaver',
    tab: 'security',
    icon: 'fa-folder',
    keywords: ['chat saver', 'audit', 'history', 'messages'],
    category: 'Security'
  },
  {
    id: 'confessions',
    title: 'Confessions',
    description: 'Anonymous confession system',
    type: 'feature',
    path: '/dashboard/confessions',
    tab: 'community',
    icon: 'fa-comment',
    keywords: ['confessions', 'anonymous', 'secrets'],
    category: 'Community'
  },
  {
    id: 'counting',
    title: 'Counting',
    description: 'Number counting game channel',
    type: 'feature',
    path: '/dashboard/counting',
    tab: 'community',
    icon: 'fa-hashtag',
    keywords: ['counting', 'numbers', 'game', 'channel'],
    category: 'Community'
  },
  {
    id: 'custom-voice',
    title: 'Custom Voice',
    description: 'Temporary voice channels',
    type: 'feature',
    path: '/dashboard/customvoice',
    tab: 'entertainment',
    icon: 'fa-microphone',
    keywords: ['voice', 'channels', 'temporary', 'custom'],
    category: 'Entertainment'
  },
  {
    id: 'embeds',
    title: 'Embeds',
    description: 'Create custom embeds',
    type: 'feature',
    path: '/dashboard/embedbuilder',
    tab: 'actions',
    icon: 'fa-link',
    keywords: ['embeds', 'builder', 'custom', 'messages'],
    category: 'Actions'
  },
  {
    id: 'feeds',
    title: 'Feeds',
    description: 'Subscribe to RSS feeds',
    type: 'feature',
    path: '/dashboard/feeds',
    tab: 'actions',
    icon: 'fa-newspaper',
    keywords: ['feeds', 'rss', 'news', 'updates'],
    category: 'Actions'
  },
  {
    id: 'giveaways',
    title: 'Giveaways',
    description: 'Host contests and prizes',
    type: 'feature',
    path: '/dashboard/giveaways',
    tab: 'entertainment',
    icon: 'fa-gift',
    keywords: ['giveaways', 'contests', 'prizes', 'events'],
    category: 'Entertainment'
  },
  {
    id: 'greets',
    title: 'Greets',
    description: 'Welcome and goodbye messages',
    type: 'feature',
    path: '/dashboard/multigreets',
    tab: 'actions',
    icon: 'fa-bell',
    keywords: ['greets', 'welcome', 'goodbye', 'messages'],
    category: 'Actions'
  },
  {
    id: 'highlights',
    title: 'Highlights',
    description: 'Keyword notification system',
    type: 'feature',
    path: '/dashboard/highlights',
    tab: 'community',
    icon: 'fa-bolt',
    keywords: ['highlights', 'keywords', 'notifications', 'mentions'],
    category: 'Community'
  },
  {
    id: 'invites',
    title: 'Invites',
    description: 'Track who invited users',
    type: 'feature',
    path: '/dashboard/invites',
    tab: 'community',
    icon: 'fa-users',
    keywords: ['invites', 'tracking', 'referrals', 'recruitment'],
    category: 'Community'
  },
  {
    id: 'logging',
    title: 'Logging',
    description: 'Track server events and activities',
    type: 'feature',
    path: '/dashboard/logging',
    tab: 'security',
    icon: 'fa-file',
    keywords: ['logging', 'events', 'audit', 'history'],
    category: 'Security'
  },
  {
    id: 'message-stats',
    title: 'Message Stats',
    description: 'Track message activity',
    type: 'feature',
    path: '/dashboard/messagestats',
    tab: 'analytics',
    icon: 'fa-envelope',
    keywords: ['message stats', 'activity', 'tracking', 'analytics'],
    category: 'Analytics'
  },
  {
    id: 'moderation',
    title: 'Moderation',
    description: 'User warnings and punishments',
    type: 'feature',
    path: '/dashboard/moderation',
    tab: 'security',
    icon: 'fa-flag',
    keywords: ['moderation', 'warnings', 'punishments', 'discipline'],
    category: 'Security'
  },
  {
    id: 'music-player',
    title: 'Music Player',
    description: 'Control bot music playback',
    type: 'feature',
    path: '/dashboard/music',
    tab: 'entertainment',
    icon: 'fa-music',
    keywords: ['music', 'player', 'songs', 'queue', 'audio'],
    category: 'Entertainment'
  },
  {
    id: 'patreon',
    title: 'Patreon',
    description: 'Supporter tier management',
    type: 'feature',
    path: '/dashboard/patreon',
    tab: 'community',
    icon: 'fa-heart',
    keywords: ['patreon', 'supporters', 'donations', 'premium'],
    category: 'Community'
  },
  {
    id: 'repeaters',
    title: 'Repeaters',
    description: 'Automated recurring messages',
    type: 'feature',
    path: '/dashboard/repeaters',
    tab: 'actions',
    icon: 'fa-sync',
    keywords: ['repeaters', 'recurring', 'scheduled', 'messages'],
    category: 'Actions'
  },
  {
    id: 'reputation',
    title: 'Reputation',
    description: 'User reputation and rewards',
    type: 'feature',
    path: '/dashboard/reputation',
    tab: 'community',
    icon: 'fa-trophy',
    keywords: ['reputation', 'rep', 'rewards', 'karma'],
    category: 'Community'
  },
  {
    id: 'role-greets',
    title: 'Role Greets',
    description: 'Role-specific welcome messages',
    type: 'feature',
    path: '/dashboard/rolegreets',
    tab: 'actions',
    icon: 'fa-user',
    keywords: ['role greets', 'welcome', 'roles', 'messages'],
    category: 'Actions'
  },
  {
    id: 'role-states',
    title: 'Role States',
    description: 'Persistent role memory',
    type: 'feature',
    path: '/dashboard/rolestates',
    tab: 'actions',
    icon: 'fa-tag',
    keywords: ['role states', 'persistence', 'memory', 'restore'],
    category: 'Actions'
  },
  {
    id: 'starboard',
    title: 'Starboard',
    description: 'Highlight popular messages',
    type: 'feature',
    path: '/dashboard/starboard',
    tab: 'community',
    icon: 'fa-star',
    keywords: ['starboard', 'stars', 'popular', 'messages', 'highlights'],
    category: 'Community'
  },
  {
    id: 'status-roles',
    title: 'Status Roles',
    description: 'Custom status-based role assignment',
    type: 'feature',
    path: '/dashboard/statusroles',
    tab: 'actions',
    icon: 'fa-user-circle',
    keywords: ['status roles', 'custom status', 'roles', 'automation'],
    category: 'Actions'
  },
  {
    id: 'streams',
    title: 'Streams',
    description: 'Twitch/YouTube stream alerts',
    type: 'feature',
    path: '/dashboard/streams',
    tab: 'community',
    icon: 'fa-video',
    keywords: ['streams', 'twitch', 'youtube', 'notifications'],
    category: 'Community'
  },
  {
    id: 'suggestions',
    title: 'Suggestions',
    description: 'User suggestion voting system',
    type: 'feature',
    path: '/dashboard/suggestions',
    tab: 'community',
    icon: 'fa-lightbulb',
    keywords: ['suggestions', 'voting', 'ideas', 'feedback'],
    category: 'Community'
  },
  {
    id: 'tickets',
    title: 'Tickets',
    description: 'Community help and assistance',
    type: 'feature',
    path: '/dashboard/tickets',
    tab: 'entertainment',
    icon: 'fa-ticket',
    keywords: ['tickets', 'support', 'help', 'assistance'],
    category: 'Entertainment'
  },
  {
    id: 'channel-access',
    title: 'Channel Access',
    description: 'Applications and member votes for locked channels',
    type: 'feature',
    path: '/dashboard/channel-access',
    tab: 'security',
    icon: 'fa-lock',
    keywords: ['channel access', 'applications', 'apply', 'vote', 'locked', 'gate', 'private'],
    category: 'Security'
  },
  {
    id: 'todo',
    title: 'Todo Lists',
    description: 'Server todo list management',
    type: 'feature',
    path: '/dashboard/todo',
    tab: 'community',
    icon: 'fa-check',
    keywords: ['todo', 'tasks', 'lists', 'management'],
    category: 'Community'
  },
  {
    id: 'triggers',
    title: 'Triggers',
    description: 'Automated responses and reactions',
    type: 'feature',
    path: '/dashboard/chat-triggers',
    tab: 'actions',
    icon: 'fa-comments',
    keywords: ['triggers', 'autoresponder', 'reactions', 'chat'],
    category: 'Actions'
  },
  {
    id: 'votes',
    title: 'Votes',
    description: 'Reward users for voting',
    type: 'feature',
    path: '/dashboard/votes',
    tab: 'community',
    icon: 'fa-thumbs-up',
    keywords: ['votes', 'voting', 'rewards', 'incentives'],
    category: 'Community'
  },
  {
    id: 'xp-system',
    title: 'XP System',
    description: 'Experience points and leveling',
    type: 'feature',
    path: '/dashboard/xp',
    tab: 'community',
    icon: 'fa-star',
    keywords: ['xp', 'experience', 'levels', 'ranking', 'leaderboard'],
    category: 'Community'
  },

  // Settings
  {
    id: 'general-settings',
    title: 'General Settings',
    description: 'Core bot configuration',
    type: 'feature',
    path: '/dashboard/settings',
    tab: 'settings',
    icon: 'fa-cog',
    keywords: ['settings', 'config', 'general', 'bot'],
    category: 'Settings'
  },
];

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
  
  // Register main tabs as features
  tabs.forEach(tab => {
    features.push({
      id: `${basePath}-${tab.id}`,
      title: tab.label,
      description: `${tab.label} settings for ${pageTitle}`,
      type: 'setting',
      path: `${basePath}#${tab.id}`,
      tab: category.toLowerCase(),
      icon: tab.icon,
      keywords: [tab.label.toLowerCase(), pageTitle.toLowerCase()],
      category
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
      icon: subTab.icon || parentTab?.icon,
      keywords: [subTab.label.toLowerCase(), parentTab?.label.toLowerCase() || '', pageTitle.toLowerCase()].filter(Boolean),
      category
    });
  });
  
  registerSearchFeatures(features);
}

// Combined searchable features (static + dynamic)
export const searchableFeatures = (() => {
  return [...staticSearchableFeatures, ...dynamicSearchRegistry];
});

// Make it reactive - this will be called each time search is performed
export function getSearchableFeatures(): SearchableItem[] {
  return [...staticSearchableFeatures, ...dynamicSearchRegistry];
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
export function openSearch() {
  if (!isSearchOpen) {
    searchStore.update(state => ({ ...state, isOpen: true, query: '', selectedIndex: 0 }));
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