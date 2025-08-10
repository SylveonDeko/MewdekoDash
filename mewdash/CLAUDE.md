# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MewdekoDash is the official web dashboard for Mewdeko, a Discord bot. This is a SvelteKit application that provides a comprehensive web interface for managing Discord bot features and server settings.

## Development Commands

```bash
# Start development server (port 5173)
npm run dev

# Build for production (includes sitemap generation)
npm run build

# Preview production build
npm run preview

# Type checking
npm run check

# Type checking with watch mode
npm run check:watch

# Generate sitemap only
npm run generate-sitemap
```

## Architecture

### Tech Stack
- **SvelteKit** - Full-stack framework with SSR
- **TypeScript** - Type safety throughout
- **Tailwind CSS** - Utility-first CSS with custom theming
- **Redis** - Session management and caching
- **Discord OAuth2** - Authentication system

### Key Directories
- `src/lib/components/` - 30+ reusable Svelte components
- `src/lib/stores/` - Svelte stores for state management
- `src/lib/types/` - TypeScript type definitions
- `src/routes/dashboard/` - Dashboard feature modules (15+ modules)
- `src/routes/api/` - API endpoints and proxy handlers

### Dashboard Modules
The dashboard manages Discord bot features including:
- **Permissions** - Advanced permission system
- **Chat Triggers** - Custom auto-responses
- **XP System** - Leveling and rewards
- **Music Player** - Queue management with real-time controls
- **Starboard** - Message highlighting
- **Suggestions** - Community feedback system
- **Tickets** - Support ticket system
- **Giveaways** - Contest management
- **Multi Greets** - Welcome messages
- **Role States** - Role persistence
- **Performance** - Bot health monitoring

## API Architecture

The application features a sophisticated API layer:
- Communicates with multiple Mewdeko bot instances
- Handles Discord API integration through `src/lib/server/discordApi.ts`
- Uses Redis for session management and caching
- Supports real-time updates via WebSocket connections
- Type-safe endpoints with comprehensive error handling

## Authentication Flow

1. Discord OAuth2 integration via `/api/discord/login`
2. Callback handling at `/api/discord/callback`
3. Session management with encrypted cookies
4. Per-guild permission validation
5. Multi-instance bot support

## Development Guidelines

### Type Safety
- All Discord IDs use BigInt handling via `json-bigint`
- Comprehensive TypeScript definitions in `src/lib/types/`
- Discord API types from `discord-api-types` package

### Component Architecture
- Reusable components in `src/lib/components/`
- Store-based state management
- Responsive design with mobile navigation
- Dynamic theming using ColorThief for avatar-based colors

### API Patterns
- Server-side data loading in `+page.server.ts` files
- Client-side API calls through `src/lib/api.ts`
- Proxy endpoints for external API calls
- Redis integration for performance optimization

## Design Language & Component Patterns

### DashboardPageLayout Usage
**Standard Layout Pattern:**
```svelte
<DashboardPageLayout
  {title}
  {subtitle}
  {icon}
  {tabs}
  bind:activeTab
  {actionButtons}
  {guildName}
  bind:notificationMessage
  bind:notificationType
>
  <!-- Tab content here -->
</DashboardPageLayout>
```

**Tab Structure:**
```typescript
const tabs = [
  { id: "server", label: "Server Management", icon: Settings },
  { id: "roles", label: "Auto-Assign Roles", icon: Users },
  { id: "protection", label: "Protection Systems", icon: Shield }
];
```

**Layout Characteristics:**
- Responsive max-width: `max-w-[98%] sm:max-w-[90%] lg:max-w-[80%]`
- Tab overflow handled with external scroll buttons
- Consistent transitions with `fly` animations
- Mobile-first responsive design

### ColorStore Integration
**Standard Color Usage:**
```svelte
<!-- Container backgrounds -->
style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
       border-color: {$colorStore.primary}30;"

<!-- Button styling -->
style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"

<!-- Text colors -->
style="color: {$colorStore.text}"      <!-- Primary text -->
style="color: {$colorStore.muted}"     <!-- Secondary text -->

<!-- Input fields -->
style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
```

**Color Opacity Patterns:**
- `05` - Very subtle backgrounds
- `08` - Input field backgrounds  
- `10-15` - Container backgrounds
- `20` - Button backgrounds
- `30` - Border colors
- `40` - Active state borders
- `50` - Disabled/muted elements

### DiscordSelector Patterns
**Standard Usage:**
```svelte
<DiscordSelector
  type="role|channel|user|timezone|custom"
  options={availableRoles}
  bind:selected={selectedValue}
  placeholder="Select..."
  multiple={false}
/>
```

**Pre-population Pattern:**
```svelte
// Always convert BigInt to string for selector
const selectedRoles = (existingRoles || []).map(id => id.toString());
```

**Option Format:**
```typescript
// For roles/channels/users
{ id: string, name: string, color?: number, type?: number }

// For custom options
{ id: string, name: string, label: string, icon?: string }
```

### Container & Card Patterns
**Standard Container:**
```svelte
<div class="backdrop-blur-sm rounded-2xl border p-6 shadow-2xl transition-all"
     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
            border-color: {$colorStore.primary}30;"
     in:fly={{ y: 20, duration: 300, delay: 100 }}>
```

**Section Headers:**
```svelte
<div class="flex items-center gap-4 mb-6">
  <div class="p-3 rounded-xl"
       style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
    <svelte:component this={Icon} class="w-6 h-6" style="color: {$colorStore.primary}" />
  </div>
  <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Section Title</h2>
</div>
```

### Button Patterns
**Primary Actions:**
```svelte
<button
  class="px-4 py-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2 min-h-[44px]"
  style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
>
  <Icon class="w-4 h-4" />
  Action
</button>
```

**Destructive Actions:**
```svelte
<button
  class="px-3 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 min-h-[36px] min-w-[80px]"
  style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
>
  Remove
</button>
```

### Form Input Patterns
**Text Inputs:**
```svelte
<input
  type="text"
  class="w-full px-3 py-2 rounded-lg border transition-colors"
  style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
  placeholder="Enter value..."
/>
```

**Textareas:**
```svelte
<textarea
  class="w-full px-3 py-2 rounded-lg border transition-colors resize-none"
  style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text}"
  rows="3"
/>
```

### Responsive Design Patterns
**Mobile-First Approach:**
- Touch targets: `min-h-[44px]` (minimum 44px height)
- Responsive headers: `flex-col sm:flex-row`
- Responsive spacing: `gap-4` mobile, `gap-6` desktop
- Responsive padding: `px-3 sm:px-4 lg:px-6`

**Grid Patterns:**
```svelte
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

### Animation Patterns
**Page Transitions:**
```svelte
in:fly={{ y: 20, duration: 300, delay: 100 }}
```

**Staggered Animations:**
```svelte
in:fly={{ y: 20, duration: 300, delay: index * 50 }}
```

**Hover Effects:**
```svelte
class="transition-all hover:scale-105"
class="transition-all hover:scale-[1.02]"  <!-- Subtle hover -->
```

### Error Handling Patterns
**Loading States:**
```svelte
<button disabled={saving}>
  {#if saving}
    <RefreshCw class="w-4 h-4 animate-spin" />
  {/if}
  Save
</button>
```

**Error Messages:**
```svelte
{#if error}
  <div class="p-4 rounded-lg" style="background: {$colorStore.accent}10; color: {$colorStore.accent};">
    {error}
  </div>
{/if}
```

### Modal Patterns
**Standard Modal:**
```svelte
{#if showModal}
  <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="p-6 rounded-2xl max-w-md w-full mx-4" 
         style="background: {$colorStore.background}; border: 1px solid {$colorStore.primary}30;">
      <h3 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">Modal Title</h3>
      <!-- Content -->
    </div>
  </div>
{/if}
```

### API Integration Patterns
**Loading Pattern:**
```svelte
onMount(async () => {
  try {
    loading = true;
    const [data1, data2] = await Promise.all([
      api.getData1($currentGuild.id),
      api.getData2($currentGuild.id)
    ]);
    // Process data
  } catch (err) {
    error = err.message;
  } finally {
    loading = false;
  }
});
```

**BigInt Handling:**
```typescript
// Always convert to string for frontend
const roleId = BigInt(selectedRole);
const roleString = roleId.toString();
```

### Accessibility Patterns
**ARIA Labels:**
```svelte
<button 
  aria-label="Remove item {item.name}"
  aria-busy={loading}
  tabindex={active ? 0 : -1}
>
```

**Keyboard Navigation:**
```svelte
on:keydown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    handleAction();
  }
}}
```

## Important Notes

- The application manages multiple Discord bot instances
- All routes under `/dashboard` require authentication
- Music player features require WebSocket connections
- Image proxying is handled through `/api/proxy-image`
- Sitemap generation runs automatically during build
- **Always follow the design language patterns above for consistency**
- **Use ColorStore for all theming - never hardcode colors**
- **Ensure mobile-first responsive design with proper touch targets**
- **Test both overflow and non-overflow states for tab navigation**