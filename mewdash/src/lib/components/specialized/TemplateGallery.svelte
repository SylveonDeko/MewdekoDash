<!-- TemplateGallery.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";

  interface Props {
    selectedCategory?: string;
    onselect?: (detail: { template: EmbedTemplate }) => void;
  }

  let { selectedCategory = $bindable("all"), onselect }: Props = $props();

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

  const templates: EmbedTemplate[] = $derived([
    // Welcome Templates
    {
      id: 'welcome-basic',
      name: m.embedbuilder.templatesWelcomeBasicName(),
      description: m.embedbuilder.templatesWelcomeBasicDescription(),
      category: 'welcome',
      icon: "fa-users",
      preview: {
        title: m.embedbuilder.templatesWelcomeBasicTitle(),
        description: m.embedbuilder.templatesWelcomeBasicBody(),
        color: '#5865F2',
        footer: { text: m.embedbuilder.templatesWelcomeBasicFooter() }
      },
      embed: {
        title: m.embedbuilder.templatesWelcomeBasicTitle(),
        description: m.embedbuilder.templatesWelcomeBasicBody(),
        color: '#5865F2',
        footer: { text: m.embedbuilder.templatesWelcomeBasicFooter(), icon_url: '' },
        author: { name: '', url: '', icon_url: '' },
        thumbnail: { url: '' },
        image: { url: '' },
        fields: []
      }
    },
    {
      id: 'welcome-detailed',
      name: m.embedbuilder.templatesWelcomeDetailedName(),
      description: m.embedbuilder.templatesWelcomeDetailedDescription(),
      category: 'welcome',
      icon: "fa-crown",
      preview: {
        title: m.embedbuilder.templatesWelcomeDetailedTitle(),
        description: m.embedbuilder.templatesWelcomeDetailedBody(),
        color: '#00D166',
        author: { name: '%user.name%', icon_url: '%user.avatar%' },
        thumbnail: { url: '%server.icon%' },
        fields: [
          { name: m.embedbuilder.templatesWelcomeDetailedFieldRulesName(), value: m.embedbuilder.templatesWelcomeDetailedFieldRulesValue(), inline: true },
          { name: m.embedbuilder.templatesWelcomeDetailedFieldStartName(), value: m.embedbuilder.templatesWelcomeDetailedFieldStartValue(), inline: true },
          { name: m.embedbuilder.templatesWelcomeDetailedFieldFunName(), value: m.embedbuilder.templatesWelcomeDetailedFieldFunValue(), inline: true }
        ],
        footer: { text: m.embedbuilder.templatesWelcomeDetailedFooter() }
      },
      embed: {
        title: m.embedbuilder.templatesWelcomeDetailedTitle(),
        description: m.embedbuilder.templatesWelcomeDetailedBody(),
        color: '#00D166',
        author: { name: '%user.name%', url: '', icon_url: '%user.avatar%' },
        thumbnail: { url: '%server.icon%' },
        image: { url: '' },
        fields: [
          { name: m.embedbuilder.templatesWelcomeDetailedFieldRulesName(), value: m.embedbuilder.templatesWelcomeDetailedFieldRulesValue(), inline: true, id: 1 },
          { name: m.embedbuilder.templatesWelcomeDetailedFieldStartName(), value: m.embedbuilder.templatesWelcomeDetailedFieldStartValue(), inline: true, id: 2 },
          { name: m.embedbuilder.templatesWelcomeDetailedFieldFunName(), value: m.embedbuilder.templatesWelcomeDetailedFieldFunValue(), inline: true, id: 3 }
        ],
        footer: { text: m.embedbuilder.templatesWelcomeDetailedFooter(), icon_url: '' }
      }
    },

    // Announcement Templates
    {
      id: 'announcement-basic',
      name: m.embedbuilder.templatesAnnouncementBasicName(),
      description: m.embedbuilder.templatesAnnouncementBasicDescription(),
      category: 'announcements',
      icon: "fa-bell",
      preview: {
        title: m.embedbuilder.templatesAnnouncementBasicTitle(),
        description: m.embedbuilder.templatesAnnouncementBasicBody(),
        color: '#FEE75C',
        footer: { text: m.embedbuilder.templatesAnnouncementBasicFooter() }
      },
      embed: {
        title: m.embedbuilder.templatesAnnouncementBasicTitle(),
        description: m.embedbuilder.templatesAnnouncementBasicBody(),
        color: '#FEE75C',
        footer: { text: m.embedbuilder.templatesAnnouncementBasicFooter(), icon_url: '' },
        author: { name: '', url: '', icon_url: '' },
        thumbnail: { url: '' },
        image: { url: '' },
        fields: []
      }
    },
    {
      id: 'announcement-event',
      name: m.embedbuilder.templatesAnnouncementEventName(),
      description: m.embedbuilder.templatesAnnouncementEventDescription(),
      category: 'announcements',
      icon: "fa-calendar",
      preview: {
        title: m.embedbuilder.templatesAnnouncementEventTitle(),
        description: m.embedbuilder.templatesAnnouncementEventBody(),
        color: '#ED4245',
        fields: [
          { name: m.embedbuilder.templatesAnnouncementEventFieldDateName(), value: m.embedbuilder.templatesAnnouncementEventFieldDateValue(), inline: false },
          { name: m.embedbuilder.templatesAnnouncementEventFieldLocationName(), value: m.embedbuilder.templatesAnnouncementEventFieldLocationValue(), inline: true },
          { name: m.embedbuilder.templatesAnnouncementEventFieldPrizesName(), value: m.embedbuilder.templatesAnnouncementEventFieldPrizesValue(), inline: true }
        ],
        footer: { text: m.embedbuilder.templatesAnnouncementEventFooter() }
      },
      embed: {
        title: m.embedbuilder.templatesAnnouncementEventTitle(),
        description: m.embedbuilder.templatesAnnouncementEventBody(),
        color: '#ED4245',
        fields: [
          { name: m.embedbuilder.templatesAnnouncementEventFieldDateName(), value: m.embedbuilder.templatesAnnouncementEventFieldDateValue(), inline: false, id: 1 },
          { name: m.embedbuilder.templatesAnnouncementEventFieldLocationName(), value: m.embedbuilder.templatesAnnouncementEventFieldLocationValue(), inline: true, id: 2 },
          { name: m.embedbuilder.templatesAnnouncementEventFieldPrizesName(), value: m.embedbuilder.templatesAnnouncementEventFieldPrizesValue(), inline: true, id: 3 }
        ],
        footer: { text: m.embedbuilder.templatesAnnouncementEventFooter(), icon_url: '' },
        author: { name: '', url: '', icon_url: '' },
        thumbnail: { url: '' },
        image: { url: '' }
      }
    },

    // Rules Templates
    {
      id: 'rules-basic',
      name: m.embedbuilder.templatesRulesBasicName(),
      description: m.embedbuilder.templatesRulesBasicDescription(),
      category: 'rules',
      icon: "fa-shield",
      preview: {
        title: m.embedbuilder.templatesRulesBasicTitle(),
        description: m.embedbuilder.templatesRulesBasicBody(),
        color: '#57F287',
        fields: [
          { name: m.embedbuilder.templatesRulesBasicFieldRespectName(), value: m.embedbuilder.templatesRulesBasicFieldRespectValue(), inline: false },
          { name: m.embedbuilder.templatesRulesBasicFieldSpamName(), value: m.embedbuilder.templatesRulesBasicFieldSpamValue(), inline: false },
          { name: m.embedbuilder.templatesRulesBasicFieldCleanName(), value: m.embedbuilder.templatesRulesBasicFieldCleanValue(), inline: false }
        ]
      },
      embed: {
        title: m.embedbuilder.templatesRulesBasicTitle(),
        description: m.embedbuilder.templatesRulesBasicBody(),
        color: '#57F287',
        fields: [
          { name: m.embedbuilder.templatesRulesBasicFieldRespectName(), value: m.embedbuilder.templatesRulesBasicFieldRespectValue(), inline: false, id: 1 },
          { name: m.embedbuilder.templatesRulesBasicFieldSpamName(), value: m.embedbuilder.templatesRulesBasicFieldSpamValue(), inline: false, id: 2 },
          { name: m.embedbuilder.templatesRulesBasicFieldCleanName(), value: m.embedbuilder.templatesRulesBasicFieldCleanValue(), inline: false, id: 3 }
        ],
        footer: { text: m.embedbuilder.templatesRulesBasicFooter(), icon_url: '' },
        author: { name: '', url: '', icon_url: '' },
        thumbnail: { url: '' },
        image: { url: '' }
      }
    },

    // Info Templates
    {
      id: 'info-basic',
      name: m.embedbuilder.templatesInfoBasicName(),
      description: m.embedbuilder.templatesInfoBasicDescription(),
      category: 'info',
      icon: "fa-circle-info",
      preview: {
        title: m.embedbuilder.templatesInfoBasicTitle(),
        description: m.embedbuilder.templatesInfoBasicBody(),
        color: '#3498DB',
        footer: { text: m.embedbuilder.templatesInfoBasicFooter() }
      },
      embed: {
        title: m.embedbuilder.templatesInfoBasicTitle(),
        description: m.embedbuilder.templatesInfoBasicBody(),
        color: '#3498DB',
        footer: { text: m.embedbuilder.templatesInfoBasicFooter(), icon_url: '' },
        author: { name: '', url: '', icon_url: '' },
        thumbnail: { url: '' },
        image: { url: '' },
        fields: []
      }
    },

    // Interactive Templates
    {
      id: 'interactive-poll',
      name: m.embedbuilder.templatesInteractivePollName(),
      description: m.embedbuilder.templatesInteractivePollDescription(),
      category: 'interactive',
      icon: "fa-bolt",
      preview: {
        title: m.embedbuilder.templatesInteractivePollTitle(),
        description: m.embedbuilder.templatesInteractivePollBody(),
        color: '#9C59B6',
        fields: [
          { name: m.embedbuilder.templatesInteractivePollFieldAName(), value: m.embedbuilder.templatesInteractivePollFieldAValue(), inline: true },
          { name: m.embedbuilder.templatesInteractivePollFieldBName(), value: m.embedbuilder.templatesInteractivePollFieldBValue(), inline: true }
        ],
        footer: { text: m.embedbuilder.templatesInteractivePollFooter() }
      },
      embed: {
        title: m.embedbuilder.templatesInteractivePollTitle(),
        description: m.embedbuilder.templatesInteractivePollBody(),
        color: '#9C59B6',
        fields: [
          { name: m.embedbuilder.templatesInteractivePollFieldAName(), value: m.embedbuilder.templatesInteractivePollFieldAValue(), inline: true, id: 1 },
          { name: m.embedbuilder.templatesInteractivePollFieldBName(), value: m.embedbuilder.templatesInteractivePollFieldBValue(), inline: true, id: 2 }
        ],
        footer: { text: m.embedbuilder.templatesInteractivePollFooter(), icon_url: '' },
        author: { name: '', url: '', icon_url: '' },
        thumbnail: { url: '' },
        image: { url: '' }
      }
    },

    // Fun Templates
    {
      id: 'fun-celebration',
      name: m.embedbuilder.templatesFunCelebrationName(),
      description: m.embedbuilder.templatesFunCelebrationDescription(),
      category: 'fun',
      icon: "fa-trophy",
      preview: {
        title: m.embedbuilder.templatesFunCelebrationTitle(),
        description: m.embedbuilder.templatesFunCelebrationBody(),
        color: '#F1C40F',
        author: { name: m.embedbuilder.templatesFunCelebrationAuthor() },
        thumbnail: { url: '🏆' }
      },
      embed: {
        title: m.embedbuilder.templatesFunCelebrationTitle(),
        description: m.embedbuilder.templatesFunCelebrationBody(),
        color: '#F1C40F',
        author: { name: m.embedbuilder.templatesFunCelebrationAuthor(), url: '', icon_url: '' },
        thumbnail: { url: '🏆' },
        image: { url: '' },
        fields: [],
        footer: { text: '', icon_url: '' }
      }
    }
  ]);

  const categories = $derived([
    { id: 'all', name: m.embedbuilder.templatesCategoryAll(), icon: "fa-sparkles" },
    { id: 'welcome', name: m.common.welcome(), icon: "fa-users" },
    { id: 'announcements', name: m.common.announcements(), icon: "fa-bell" },
    { id: 'rules', name: m.common.rules(), icon: "fa-shield" },
    { id: 'info', name: m.embedbuilder.templatesCategoryInfo(), icon: "fa-circle-info" },
    { id: 'interactive', name: m.embedbuilder.templatesCategoryInteractive(), icon: "fa-bolt" },
    { id: 'fun', name: m.embedbuilder.templatesCategoryFun(), icon: "fa-trophy" }
  ]);

  let filteredTemplates = $derived(selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory));

  function selectTemplate(template: EmbedTemplate) {
    onselect?.({ template });
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
        onclick={() => selectedCategory = category.id}
        onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (selectedCategory = category.id)}
      >
        <i class="fa-solid {category.icon}" style="font-size: 14px;"></i>
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
        onclick={() => selectTemplate(template)}
        onkeydown={(e) => handleKeydown(e, template)}
        role="button"
        tabindex="0"
        aria-label={m.embedbuilder.templatesSelectAria({ name: template.name })}
      >
        <!-- Template Header -->
        <div class="p-3 border-b" style="border-color: {$colorStore.primary}15;">
          <div class="flex items-center gap-2">
              <div class="p-1.5 rounded-sm" style="background: {$colorStore.primary}15;">
              <i class="fa-solid {template.icon}" style="color: {$colorStore.primary}; font-size: 14px;"></i>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="font-medium text-sm truncate" style="color: {$colorStore.text};">{template.name}</h3>
              <p class="text-xs text-gray-500 truncate">{template.description}</p>
            </div>
          </div>
        </div>

        <!-- Template Preview -->
        <div class="p-3">
            <div class="bg-[#36393f] rounded-sm p-2 text-white text-xs font-mono max-h-24 overflow-hidden">
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
                    {template.preview.fields.length === 1 ? m.embedbuilder.templatesFieldCountOne({ count: 1 }) : m.embedbuilder.templatesFieldCountOther({ count: template.preview.fields.length })}
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
        <i class="fa-utility-duo fa-regular fa-sparkles" style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 32px;"></i>
      </div>
      <h3 class="text-lg font-semibold mb-2" style="color: {$colorStore.text};">{m.embedbuilder.templatesEmptyTitle()}</h3>
      <p class="text-sm" style="color: {$colorStore.muted};">{m.embedbuilder.templatesEmptyHint()}</p>
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