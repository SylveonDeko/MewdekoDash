// lib/stores/searchStore.ts
import { writable } from 'svelte/store';
import { 
  BarChart3, 
  Users, 
  Music, 
  Zap, 
  Shield, 
  Settings,
  Star,
  MessageSquare,
  Lightbulb,
  Cake,
  Ticket,
  Heart,
  Bot,
  Code,
  Bell,
  UserCheck,
  ToggleLeft,
  Gift,
  Mic,
  MessageSquareWarning,
  FileText,
  Lock,
  Activity,
  Database,
  Globe,
  Palette,
  RotateCcw,
  RefreshCw,
  TrendingUp,
  Award
} from 'lucide-svelte';

export interface SearchableItem {
  id: string;
  title: string;
  description: string;
  type: 'tab' | 'feature' | 'page' | 'setting';
  path: string;
  tab?: string;
  icon: any;
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
    icon: BarChart3,
    keywords: ['overview', 'dashboard', 'stats', 'home', 'main'],
    category: 'Navigation'
  },
  {
    id: 'community-tab',
    title: 'Community',
    description: 'XP, suggestions, tickets, birthdays',
    type: 'tab',
    path: '/dashboard?tab=community',
    icon: Users,
    keywords: ['community', 'users', 'xp', 'experience', 'suggestions', 'tickets'],
    category: 'Navigation'
  },
  {
    id: 'entertainment-tab',
    title: 'Entertainment',
    description: 'Music, voice, giveaways',
    type: 'tab',
    path: '/dashboard?tab=entertainment',
    icon: Music,
    keywords: ['entertainment', 'music', 'voice', 'giveaways', 'fun'],
    category: 'Navigation'
  },
  {
    id: 'actions-tab',
    title: 'Actions',
    description: 'Greets, triggers, embeds',
    type: 'tab',
    path: '/dashboard?tab=actions',
    icon: Zap,
    keywords: ['actions', 'automation', 'triggers', 'greets', 'embeds'],
    category: 'Navigation'
  },
  {
    id: 'security-tab',
    title: 'Security',
    description: 'Moderation and protection',
    type: 'tab',
    path: '/dashboard?tab=security',
    icon: Shield,
    keywords: ['security', 'moderation', 'protection', 'safety', 'admin'],
    category: 'Navigation'
  },
  {
    id: 'settings-tab',
    title: 'Settings',
    description: 'Bot config and roles',
    type: 'tab',
    path: '/dashboard?tab=settings',
    icon: Settings,
    keywords: ['settings', 'config', 'configuration', 'roles', 'setup'],
    category: 'Navigation'
  },

  // Community Features
  {
    id: 'xp-system',
    title: 'XP System',
    description: 'Experience points and leveling',
    type: 'feature',
    path: '/dashboard/xp',
    tab: 'community',
    icon: Star,
    keywords: ['xp', 'experience', 'levels', 'ranking', 'leaderboard'],
    category: 'Community'
  },
  {
    id: 'suggestions',
    title: 'Suggestions',
    description: 'User suggestion voting system',
    type: 'feature',
    path: '/dashboard/suggestions',
    tab: 'community',
    icon: Lightbulb,
    keywords: ['suggestions', 'voting', 'ideas', 'feedback'],
    category: 'Community'
  },
  {
    id: 'starboard',
    title: 'Starboard',
    description: 'Highlight popular messages',
    type: 'feature',
    path: '/dashboard/starboard',
    tab: 'community',
    icon: Star,
    keywords: ['starboard', 'stars', 'popular', 'messages', 'highlights'],
    category: 'Community'
  },
  {
    id: 'birthdays',
    title: 'Birthdays',
    description: 'Celebrate member birthdays',
    type: 'feature',
    path: '/dashboard/birthday',
    tab: 'community',
    icon: Cake,
    keywords: ['birthday', 'birthdays', 'celebrate', 'anniversary'],
    category: 'Community'
  },
  {
    id: 'tickets',
    title: 'Support Tickets',
    description: 'Community help and assistance',
    type: 'feature',
    path: '/dashboard/tickets',
    tab: 'community',
    icon: Ticket,
    keywords: ['tickets', 'support', 'help', 'assistance'],
    category: 'Community'
  },
  {
    id: 'invite-tracking',
    title: 'Invite Tracking',
    description: 'Track who invited users',
    type: 'feature',
    path: '/dashboard/invites',
    tab: 'community',
    icon: Users,
    keywords: ['invites', 'tracking', 'referrals', 'recruitment'],
    category: 'Community'
  },
  {
    id: 'patreon',
    title: 'Patreon Integration',
    description: 'Supporter tier management',
    type: 'feature',
    path: '/dashboard/patreon',
    tab: 'community',
    icon: Heart,
    keywords: ['patreon', 'supporters', 'donations', 'premium'],
    category: 'Community'
  },

  // Entertainment Features
  {
    id: 'music-player',
    title: 'Music Player',
    description: 'Control bot music playback',
    type: 'feature',
    path: '/dashboard/music',
    tab: 'entertainment',
    icon: Music,
    keywords: ['music', 'player', 'songs', 'queue', 'audio'],
    category: 'Entertainment'
  },
  {
    id: 'custom-voice',
    title: 'Custom Voice Channels',
    description: 'Temporary voice channels',
    type: 'feature',
    path: '/dashboard/customvoice',
    tab: 'entertainment',
    icon: Mic,
    keywords: ['voice', 'channels', 'temporary', 'custom'],
    category: 'Entertainment'
  },
  {
    id: 'giveaways',
    title: 'Giveaways',
    description: 'Host contests and prizes',
    type: 'feature',
    path: '/dashboard/giveaways',
    tab: 'entertainment',
    icon: Gift,
    keywords: ['giveaways', 'contests', 'prizes', 'events'],
    category: 'Entertainment'
  },

  // Actions Features
  {
    id: 'chat-triggers',
    title: 'Chat Triggers',
    description: 'Automated responses and reactions',
    type: 'feature',
    path: '/dashboard/chat-triggers',
    tab: 'actions',
    icon: MessageSquare,
    keywords: ['triggers', 'autoresponder', 'reactions', 'chat'],
    category: 'Actions'
  },
  {
    id: 'multi-greets',
    title: 'Multi Greets',
    description: 'Welcome and goodbye messages',
    type: 'feature',
    path: '/dashboard/multigreets',
    tab: 'actions',
    icon: Bell,
    keywords: ['greets', 'welcome', 'goodbye', 'messages'],
    category: 'Actions'
  },
  {
    id: 'role-greets',
    title: 'Role Greets',
    description: 'Role-specific welcome messages',
    type: 'feature',
    path: '/dashboard/rolegreets',
    tab: 'actions',
    icon: UserCheck,
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
    icon: RotateCcw,
    keywords: ['role states', 'persistence', 'memory', 'restore'],
    category: 'Actions'
  },
  {
    id: 'embed-builder',
    title: 'Embed Builder',
    description: 'Create custom embeds',
    type: 'feature',
    path: '/dashboard/embedbuilder',
    tab: 'actions',
    icon: Code,
    keywords: ['embeds', 'builder', 'custom', 'messages'],
    category: 'Actions'
  },
  {
    id: 'afk-system',
    title: 'AFK System',
    description: 'Away status management',
    type: 'feature',
    path: '/dashboard/afk',
    tab: 'actions',
    icon: ToggleLeft,
    keywords: ['afk', 'away', 'status', 'idle'],
    category: 'Actions'
  },

  // Security Features
  {
    id: 'moderation',
    title: 'Moderation',
    description: 'User warnings and punishments',
    type: 'feature',
    path: '/dashboard/moderation',
    tab: 'security',
    icon: MessageSquareWarning,
    keywords: ['moderation', 'warnings', 'punishments', 'discipline'],
    category: 'Security'
  },
  {
    id: 'administration',
    title: 'Administration',
    description: 'Server protection and roles',
    type: 'feature',
    path: '/dashboard/administration',
    tab: 'security',
    icon: Shield,
    keywords: ['admin', 'administration', 'protection', 'roles'],
    category: 'Security'
  },
  {
    id: 'logging',
    title: 'Event Logging',
    description: 'Track server events and activities',
    type: 'feature',
    path: '/dashboard/logging',
    tab: 'security',
    icon: FileText,
    keywords: ['logging', 'events', 'audit', 'history'],
    category: 'Security'
  },
  {
    id: 'permissions',
    title: 'Permissions',
    description: 'Command access control',
    type: 'feature',
    path: '/dashboard/permissions',
    tab: 'security',
    icon: Lock,
    keywords: ['permissions', 'access', 'control', 'commands'],
    category: 'Security'
  },
  {
    id: 'chat-saver',
    title: 'Chat Saver',
    description: 'Audit trails and message history',
    type: 'feature',
    path: '/dashboard/chatsaver',
    tab: 'security',
    icon: Database,
    keywords: ['chat saver', 'audit', 'history', 'messages'],
    category: 'Security'
  },

  // Settings Features
  {
    id: 'general-settings',
    title: 'General Settings',
    description: 'Core bot configuration',
    type: 'feature',
    path: '/dashboard/settings',
    tab: 'settings',
    icon: Settings,
    keywords: ['settings', 'config', 'general', 'bot'],
    category: 'Settings'
  },
  {
    id: 'message-stats',
    title: 'Message Statistics',
    description: 'Track message activity',
    type: 'feature',
    path: '/dashboard/messagestats',
    tab: 'community',
    icon: BarChart3,
    keywords: ['message stats', 'activity', 'tracking', 'analytics'],
    category: 'Analytics'
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