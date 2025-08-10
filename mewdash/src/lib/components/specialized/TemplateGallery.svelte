<!-- TemplateGallery.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { colorStore } from "$lib/stores/colorStore";
  import { 
    MessageCircle, 
    Bell, 
    Shield, 
    Info, 
    Sparkles, 
    Users, 
    Trophy,
    Heart,
    Zap,
    Gift,
    Crown,
    Calendar
  } from "lucide-svelte";

  export let selectedCategory: string = 'all';

  const dispatch = createEventDispatcher<{
    select: { template: EmbedTemplate };
  }>();

  interface EmbedTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    icon: any;
    preview: {
      title: string;
      description: string;
      color: string;
      fields?: { name: string; value: string; inline?: boolean }[];
      author?: { name: string; icon_url?: string };
      footer?: { text: string };
      thumbnail?: { url: string };
      image?: { url: string };
    };
    embed: any;
  }

  const templates: EmbedTemplate[] = [
    // Welcome Templates
    {
      id: 'welcome-basic',
      name: 'Basic Welcome',
      description: 'Simple welcome message for new members',
      category: 'welcome',
      icon: Users,
      preview: {
        title: 'Welcome to the Server! 👋',
        description: 'Hey %user.mention%, welcome to **%server.name%**!\n\nWe\'re glad to have you here. Make sure to read our rules and introduce yourself!',
        color: '#5865F2',
        footer: { text: 'Member #%server.membercount%' }
      },
      embed: {
        title: 'Welcome to the Server! 👋',
        description: 'Hey %user.mention%, welcome to **%server.name%**!\n\nWe\'re glad to have you here. Make sure to read our rules and introduce yourself!',
        color: '#5865F2',
        footer: { text: 'Member #%server.membercount%', icon_url: '' },
        author: { name: '', url: '', icon_url: '' },
        thumbnail: { url: '' },
        image: { url: '' },
        fields: []
      }
    },
    {
      id: 'welcome-detailed',
      name: 'Detailed Welcome',
      description: 'Comprehensive welcome with server info',
      category: 'welcome',
      icon: Crown,
      preview: {
        title: 'Welcome to %server.name%! ✨',
        description: 'Hello %user.mention%! We\'re excited to have you join our community.',
        color: '#00D166',
        author: { name: '%user.name%', icon_url: '%user.avatar%' },
        thumbnail: { url: '%server.icon%' },
        fields: [
          { name: '📋 Read the Rules', value: 'Make sure to check out <#rules-channel> first!', inline: true },
          { name: '💬 Get Started', value: 'Introduce yourself in <#introductions>!', inline: true },
          { name: '🎯 Have Fun', value: 'Enjoy your stay and make new friends!', inline: true }
        ],
        footer: { text: 'You are member #%server.membercount%' }
      },
      embed: {
        title: 'Welcome to %server.name%! ✨',
        description: 'Hello %user.mention%! We\'re excited to have you join our community.',
        color: '#00D166',
        author: { name: '%user.name%', url: '', icon_url: '%user.avatar%' },
        thumbnail: { url: '%server.icon%' },
        image: { url: '' },
        fields: [
          { name: '📋 Read the Rules', value: 'Make sure to check out <#rules-channel> first!', inline: true, id: 1 },
          { name: '💬 Get Started', value: 'Introduce yourself in <#introductions>!', inline: true, id: 2 },
          { name: '🎯 Have Fun', value: 'Enjoy your stay and make new friends!', inline: true, id: 3 }
        ],
        footer: { text: 'You are member #%server.membercount%', icon_url: '' }
      }
    },

    // Announcement Templates
    {
      id: 'announcement-basic',
      name: 'Basic Announcement',
      description: 'Simple server announcement',
      category: 'announcements',
      icon: Bell,
      preview: {
        title: '📢 Server Announcement',
        description: 'Important information for all members of %server.name%.',
        color: '#FEE75C',
        footer: { text: 'Posted by %user.name%' }
      },
      embed: {
        title: '📢 Server Announcement',
        description: 'Important information for all members of %server.name%.',
        color: '#FEE75C',
        footer: { text: 'Posted by %user.name%', icon_url: '' },
        author: { name: '', url: '', icon_url: '' },
        thumbnail: { url: '' },
        image: { url: '' },
        fields: []
      }
    },
    {
      id: 'announcement-event',
      name: 'Event Announcement',
      description: 'Announce upcoming events',
      category: 'announcements',
      icon: Calendar,
      preview: {
        title: '🎉 Upcoming Event!',
        description: 'Join us for an exciting community event!',
        color: '#ED4245',
        fields: [
          { name: '📅 Date & Time', value: 'Saturday, Dec 25th at 3:00 PM EST', inline: false },
          { name: '📍 Location', value: 'Voice Channel: Community Events', inline: true },
          { name: '🎁 Prizes', value: 'Special roles and Discord Nitro!', inline: true }
        ],
        footer: { text: 'React with 🎉 to get notified!' }
      },
      embed: {
        title: '🎉 Upcoming Event!',
        description: 'Join us for an exciting community event!',
        color: '#ED4245',
        fields: [
          { name: '📅 Date & Time', value: 'Saturday, Dec 25th at 3:00 PM EST', inline: false, id: 1 },
          { name: '📍 Location', value: 'Voice Channel: Community Events', inline: true, id: 2 },
          { name: '🎁 Prizes', value: 'Special roles and Discord Nitro!', inline: true, id: 3 }
        ],
        footer: { text: 'React with 🎉 to get notified!', icon_url: '' },
        author: { name: '', url: '', icon_url: '' },
        thumbnail: { url: '' },
        image: { url: '' }
      }
    },

    // Rules Templates
    {
      id: 'rules-basic',
      name: 'Server Rules',
      description: 'Basic server rules layout',
      category: 'rules',
      icon: Shield,
      preview: {
        title: '📜 Server Rules',
        description: 'Please follow these rules to keep our community safe and fun for everyone.',
        color: '#57F287',
        fields: [
          { name: '1️⃣ Be Respectful', value: 'Treat all members with kindness and respect.', inline: false },
          { name: '2️⃣ No Spam', value: 'Keep messages relevant and avoid excessive posting.', inline: false },
          { name: '3️⃣ Keep it Clean', value: 'No inappropriate content or language.', inline: false }
        ]
      },
      embed: {
        title: '📜 Server Rules',
        description: 'Please follow these rules to keep our community safe and fun for everyone.',
        color: '#57F287',
        fields: [
          { name: '1️⃣ Be Respectful', value: 'Treat all members with kindness and respect.', inline: false, id: 1 },
          { name: '2️⃣ No Spam', value: 'Keep messages relevant and avoid excessive posting.', inline: false, id: 2 },
          { name: '3️⃣ Keep it Clean', value: 'No inappropriate content or language.', inline: false, id: 3 }
        ],
        footer: { text: 'Breaking rules may result in warnings or bans', icon_url: '' },
        author: { name: '', url: '', icon_url: '' },
        thumbnail: { url: '' },
        image: { url: '' }
      }
    },

    // Info Templates
    {
      id: 'info-basic',
      name: 'Information Card',
      description: 'General information layout',
      category: 'info',
      icon: Info,
      preview: {
        title: 'ℹ️ Information',
        description: 'Here\'s some important information you should know.',
        color: '#3498DB',
        footer: { text: 'Last updated: %date%' }
      },
      embed: {
        title: 'ℹ️ Information',
        description: 'Here\'s some important information you should know.',
        color: '#3498DB',
        footer: { text: 'Last updated: %date%', icon_url: '' },
        author: { name: '', url: '', icon_url: '' },
        thumbnail: { url: '' },
        image: { url: '' },
        fields: []
      }
    },

    // Interactive Templates
    {
      id: 'interactive-poll',
      name: 'Poll Template',
      description: 'Interactive poll with reactions',
      category: 'interactive',
      icon: Zap,
      preview: {
        title: '📊 Community Poll',
        description: 'Vote on this important community decision!',
        color: '#9C59B6',
        fields: [
          { name: '✅ Option A', value: 'React with ✅ for this choice', inline: true },
          { name: '❌ Option B', value: 'React with ❌ for this choice', inline: true }
        ],
        footer: { text: 'Poll ends in 24 hours' }
      },
      embed: {
        title: '📊 Community Poll',
        description: 'Vote on this important community decision!',
        color: '#9C59B6',
        fields: [
          { name: '✅ Option A', value: 'React with ✅ for this choice', inline: true, id: 1 },
          { name: '❌ Option B', value: 'React with ❌ for this choice', inline: true, id: 2 }
        ],
        footer: { text: 'Poll ends in 24 hours', icon_url: '' },
        author: { name: '', url: '', icon_url: '' },
        thumbnail: { url: '' },
        image: { url: '' }
      }
    },

    // Fun Templates
    {
      id: 'fun-celebration',
      name: 'Celebration',
      description: 'Celebrate achievements and milestones',
      category: 'fun',
      icon: Trophy,
      preview: {
        title: '🎉 Congratulations!',
        description: 'Let\'s celebrate this amazing achievement!',
        color: '#F1C40F',
        author: { name: 'Achievement Unlocked!' },
        thumbnail: { url: '🏆' }
      },
      embed: {
        title: '🎉 Congratulations!',
        description: 'Let\'s celebrate this amazing achievement!',
        color: '#F1C40F',
        author: { name: 'Achievement Unlocked!', url: '', icon_url: '' },
        thumbnail: { url: '🏆' },
        image: { url: '' },
        fields: [],
        footer: { text: '', icon_url: '' }
      }
    }
  ];

  const categories = [
    { id: 'all', name: 'All Templates', icon: Sparkles },
    { id: 'welcome', name: 'Welcome', icon: Users },
    { id: 'announcements', name: 'Announcements', icon: Bell },
    { id: 'rules', name: 'Rules', icon: Shield },
    { id: 'info', name: 'Information', icon: Info },
    { id: 'interactive', name: 'Interactive', icon: Zap },
    { id: 'fun', name: 'Fun', icon: Trophy }
  ];

  $: filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  function selectTemplate(template: EmbedTemplate) {
    dispatch('select', { template });
  }

  function handleKeydown(event: KeyboardEvent, template: EmbedTemplate) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectTemplate(template);
    }
  }
</script>

<div class="space-y-6">
  <!-- Category Filter -->
  <div class="flex flex-wrap gap-2">
    {#each categories as category}
      <button
        class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border"
        class:active={selectedCategory === category.id}
        style="color: {selectedCategory === category.id ? $colorStore.primary : $colorStore.muted};
               background: {selectedCategory === category.id ? $colorStore.primary + '20' : 'transparent'};
               border-color: {selectedCategory === category.id ? $colorStore.primary + '40' : $colorStore.primary + '20'};"
        on:click={() => selectedCategory = category.id}
        on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && (selectedCategory = category.id)}
      >
        <svelte:component this={category.icon} size={14} />
        {category.name}
      </button>
    {/each}
  </div>

  <!-- Templates Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
    {#each filteredTemplates as template}
      <div
        class="group cursor-pointer rounded-lg border transition-all duration-200 hover:shadow-lg overflow-hidden"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}05, {$colorStore.gradientMid}10);
               border-color: {$colorStore.primary}20;"
        on:click={() => selectTemplate(template)}
        on:keydown={(e) => handleKeydown(e, template)}
        role="button"
        tabindex="0"
        aria-label="Select {template.name} template"
      >
        <!-- Template Header -->
        <div class="p-3 border-b" style="border-color: {$colorStore.primary}15;">
          <div class="flex items-center gap-2">
            <div class="p-1.5 rounded" style="background: {$colorStore.primary}15;">
              <svelte:component this={template.icon} size={14} style="color: {$colorStore.primary};" />
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="font-medium text-sm truncate" style="color: {$colorStore.text};">{template.name}</h3>
              <p class="text-xs text-gray-500 truncate">{template.description}</p>
            </div>
          </div>
        </div>

        <!-- Template Preview -->
        <div class="p-3">
          <div class="bg-[#36393f] rounded p-2 text-white text-xs font-mono max-h-24 overflow-hidden">
            <!-- Embed Color Bar -->
            <div class="flex">
              <div class="w-0.5 rounded-l-sm mr-2" style="background: {template.preview.color};"></div>
              <div class="flex-1 space-y-1 min-w-0">
                <!-- Title -->
                {#if template.preview.title}
                  <div class="font-semibold text-white text-xs truncate">{template.preview.title}</div>
                {/if}

                <!-- Description (truncated) -->
                {#if template.preview.description}
                  <div class="text-gray-300 text-xs leading-tight line-clamp-2">
                    {template.preview.description.substring(0, 80)}{template.preview.description.length > 80 ? '...' : ''}
                  </div>
                {/if}

                <!-- Fields indicator -->
                {#if template.preview.fields && template.preview.fields.length > 0}
                  <div class="text-gray-400 text-xs">
                    {template.preview.fields.length} field{template.preview.fields.length !== 1 ? 's' : ''}
                  </div>
                {/if}
              </div>
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>

  {#if filteredTemplates.length === 0}
    <div class="text-center py-12">
      <div class="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-4"
           style="background: {$colorStore.primary}10;">
        <Sparkles size={32} style="color: {$colorStore.primary};" />
      </div>
      <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text};">No templates found</h3>
      <p class="text-sm" style="color: {$colorStore.muted};">Try selecting a different category</p>
    </div>
  {/if}
</div>

<style>
  .active {
    transform: translateY(-1px);
  }

  .group:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  .group:hover {
    transform: translateY(-2px);
  }
</style>