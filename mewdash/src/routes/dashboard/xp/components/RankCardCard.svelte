<script lang="ts">
  import { m } from "$lib/i18n";
  import { onDestroy, onMount } from "svelte";
  import { browser } from "$app/environment";
  import { xpApi } from "$lib/api/index.ts";
  import { ApiError } from "$lib/api/core";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import XpTemplateEditor from "$lib/components/dashboard/xp/XpTemplateEditor.svelte";
  import XpMobileTemplateEditor from "$lib/components/dashboard/xp/XpMobileTemplateEditor.svelte";
  import BackgroundPicker from "./BackgroundPicker.svelte";
  import SettingsGroup from "./SettingsGroup.svelte";
  import { errorText } from "./xpModel";

  interface Props {
    guildId: bigint;
    userId?: string | bigint;
    onerror: (message: string) => void;
    onbackground: (value: string) => void;
  }

  let { guildId, userId, onerror, onbackground }: Props = $props();

  interface CurrentUserData {
    username: string;
    avatarUrl: string;
    level: number;
    rank: number;
    timeOnLevel: string;
    clubName: string;
    progress: number;
  }

  let template: any = $state(null);
  let localTemplate: any = $state(null);
  let loading = $state(true);
  let failed = $state(false);
  let changedSettings = $state(new Set<string>());
  let showEditor = $state(false);
  let isMobile = $state(false);
  let saving = $state(false);
  let backgroundOpen = $state(false);
  let backgroundBusy = $state(false);
  let backgroundValue = $state("");
  let backgroundImage = $state("");
  let currentUserData: CurrentUserData | null = $state(null);
  let previewCanvas: HTMLCanvasElement | null = $state(null);
  let previewBgImage = $state<HTMLImageElement | null>(null);
  let defaultBgImage = $state<HTMLImageElement | null>(null);
  let previewBgUrl = "";
  const customPreviewImages = new Map<string, HTMLImageElement>();

  let sampleData = $state({
    username: "QuantumViper42",
    avatarUrl: "https://cdn.discordapp.com/avatars/123456789012345678/a_1234567890abcdef1234567890abcdef.gif",
    discriminator: "0001",
    displayName: "Quantum Viper",
    level: 47,
    rank: 12,
    totalXp: 234567,
    levelXp: 4890,
    requiredXp: 7200,
    timeOnLevel: "2d 8h 23m",
    clubName: "Elite Gamers",
    clubIcon: "🏆",
    joinDate: "2021-03-15",
    messageCount: 15432,
    voiceTime: "127h 45m",
    lastActive: "2 hours ago",
    badges: ["🎖️", "⚡", "🔥"],
    progress: 68,
    streak: 15,
    favoriteChannel: "general-chat",
    topEmoji: "😎"
  });

  function checkMobile() {
    isMobile = browser && window.innerWidth < 768;
  }

  function canvasHex(color: unknown, fallback = "#ffffff", alphaFirst = false): string {
    if (typeof color !== "string") return fallback;

    const raw = color.trim().replace(/^#/, "");
    if (!/^([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(raw)) {
      return fallback;
    }

    if (raw.length === 3 || raw.length === 4) {
      return `#${raw.slice(0, 3).split("").map((char) => char + char).join("")}`;
    }

    return `#${raw.length === 8 && alphaFirst ? raw.slice(2, 8) : raw.slice(0, 6)}`;
  }

  async function loadCurrentUser() {
    if (!userId) return;
    try {
      const stats = await xpApi.getUserXpStats(guildId, BigInt(userId));
      const timeOnLevel = stats.timeOnLevel
        ? { days: stats.timeOnLevel.days, hours: stats.timeOnLevel.hours, minutes: stats.timeOnLevel.minutes }
        : { days: 0, hours: 0, minutes: 0 };
      currentUserData = {
        username: stats.username,
        avatarUrl: stats.avatarUrl,
        level: stats.level,
        rank: stats.rank,
        timeOnLevel: m.xp.timeOnLevel(timeOnLevel),
        clubName: m.xp.clubFallback(),
        progress: stats.requiredXp ? Math.round((stats.levelXp / stats.requiredXp) * 100) : 0
      };
    } catch (err) {
      logger.error("Failed to load the member's XP for the preview:", err);
    }
  }

  async function loadBackground() {
    try {
      const background = await xpApi.getBackground(guildId);
      backgroundValue = background.value;
      backgroundImage = background.image;
    } catch (err) {
      if (!(err instanceof ApiError && err.status === 404)) logger.error("Failed to load the rank card background:", err);
      backgroundValue = "";
      backgroundImage = "";
    }
    if (localTemplate) localTemplate.customXpImageUrl = backgroundImage;
  }

  async function loadTemplate() {
    try {
      template = await xpApi.getXpTemplate(guildId);
      localTemplate = JSON.parse(JSON.stringify(template));
      try {
        localTemplate.customElements = JSON.parse(localTemplate.customElementsJson || "[]");
      } catch {
        localTemplate.customElements = [];
      }
      try {
        localTemplate.builtInOrder = JSON.parse(localTemplate.builtInOrderJson || "[]");
      } catch {
        localTemplate.builtInOrder = [];
      }
      if (localTemplate.templateBar) {
        if (!localTemplate.templateBar.barWidth) localTemplate.templateBar.barWidth = 20;
        if (typeof localTemplate.templateBar.barLength === "undefined") localTemplate.templateBar.barLength = 452;
        if (typeof localTemplate.templateBar.barDirection === "undefined") localTemplate.templateBar.barDirection = 3;
      }
      localTemplate.customXpImageUrl = backgroundImage;
    } catch (err) {
      logger.error("Failed to load the XP template:", err);
      failed = true;
      onerror(errorText(err, m.xp.errorLoadTemplate()));
    }
  }

  async function load() {
    await loadBackground();
    await Promise.all([loadTemplate(), loadCurrentUser()]);
    loading = false;
  }

  async function pickBackground(value: string) {
    backgroundBusy = true;
    try {
      await xpApi.setBackground(guildId, value);
      await loadBackground();
      onbackground(backgroundValue);
    } catch (err) {
      logger.error("Failed to set the rank card background:", err);
      onerror(errorText(err, m.xp.errorSaveBackground()));
    } finally {
      backgroundBusy = false;
    }
  }

  async function clearBackground() {
    backgroundBusy = true;
    try {
      await xpApi.clearBackground(guildId);
      await loadBackground();
      onbackground("");
    } catch (err) {
      logger.error("Failed to remove the rank card background:", err);
      onerror(errorText(err, m.xp.errorSaveBackground()));
    } finally {
      backgroundBusy = false;
    }
  }

  async function saveTemplate() {
    if (!localTemplate || saving) return;
    saving = true;
    try {
      const copy = JSON.parse(JSON.stringify(localTemplate));
      const imageUrl: string = copy.customXpImageUrl ?? "";
      copy.customElementsJson = JSON.stringify(copy.customElements || []);
      delete copy.customElements;
      copy.builtInOrderJson = JSON.stringify(copy.builtInOrder || []);
      delete copy.builtInOrder;
      delete copy.customXpImageUrl;

      await xpApi.updateXpTemplate(guildId, copy);

      if (imageUrl !== backgroundImage) {
        if (imageUrl) await xpApi.setBackground(guildId, imageUrl);
        else await xpApi.clearBackground(guildId).catch(() => {});
        await loadBackground();
        onbackground(backgroundValue);
      }

      const next = new Set(changedSettings);
      next.delete("template");
      changedSettings = next;
      template = JSON.parse(JSON.stringify(localTemplate));
    } catch (err) {
      logger.error("Failed to save the XP template:", err);
      onerror(errorText(err, m.xp.errorSaveTemplate()));
    } finally {
      saving = false;
    }
  }

  function resetChanges() {
    localTemplate = JSON.parse(JSON.stringify(template));
    const next = new Set(changedSettings);
    next.delete("template");
    changedSettings = next;
  }

  function renderCustomPreviewElements(ctx: CanvasRenderingContext2D) {
    if (!localTemplate) return;
    const data: any = currentUserData || sampleData;
    const resolveText = (text: string) => (text || "")
      .replaceAll(/%xp\.user(%|\.name%)/gi, data?.username || m.common.username())
      .replaceAll(/%xp\.user\.displayname%/gi, data?.displayName || data?.username || m.common.displayName())
      .replaceAll(/%xp\.level\.current%/gi, String(data?.level || 1))
      .replaceAll(/%xp\.level\.next%/gi, String((data?.level || 1) + 1))
      .replaceAll(/%xp\.rank%/gi, String(data?.rank || 1))
      .replaceAll(/%xp\.current%/gi, String(data?.currentXp || data?.xp || 0))
      .replaceAll(/%xp\.needed%/gi, String(data?.requiredXp || 100))
      .replaceAll(/%xp\.total%/gi, String(data?.totalXp || 0))
      .replaceAll(/%xp\.progress%/gi, `${Math.round(data?.progress || 0)}%`);

    for (const element of [...(localTemplate.customElements || [])].filter((item: any) => item.visible !== false).sort((a: any, b: any) => a.zIndex - b.zIndex)) {
      ctx.save();
      ctx.globalAlpha = element.opacity ?? 1; ctx.shadowColor = element.shadowColor || "transparent";
      ctx.shadowBlur = element.shadowBlur || 0; ctx.shadowOffsetX = element.shadowX || 0; ctx.shadowOffsetY = element.shadowY || 0;
      ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
      ctx.rotate((element.rotation || 0) * Math.PI / 180); ctx.translate(-(element.x + element.width / 2), -(element.y + element.height / 2));
      let fill: string | CanvasGradient = element.fill || "#5865F2";
      if (element.gradientEnd) {
        const angle = (element.gradientAngle || 0) * Math.PI / 180, radius = Math.max(element.width, element.height) / 2;
        const cx = element.x + element.width / 2, cy = element.y + element.height / 2;
        const gradient = ctx.createLinearGradient(cx - Math.cos(angle) * radius, cy - Math.sin(angle) * radius, cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
        gradient.addColorStop(0, element.fill); gradient.addColorStop(1, element.gradientEnd); fill = gradient;
      }
      ctx.fillStyle = fill; ctx.strokeStyle = element.stroke || "transparent"; ctx.lineWidth = element.strokeWidth || 0;
      if (element.type === "text") {
        ctx.font = `${element.fontSize || 24}px sans-serif`; ctx.textBaseline = "top"; ctx.textAlign = element.textAlign || "left";
        const x = element.textAlign === "center" ? element.x + element.width / 2 : element.textAlign === "right" ? element.x + element.width : element.x;
        ctx.fillText(resolveText(element.text), x, element.y);
      } else if (element.type === "image") {
        let image = customPreviewImages.get(element.url);
        if (!image && element.url) {
          image = new Image(); image.crossOrigin = "anonymous"; image.onload = renderPreview; image.src = element.url; customPreviewImages.set(element.url, image);
        }
        if (image?.complete) ctx.drawImage(image, element.x, element.y, element.width, element.height);
      } else if (element.type === "progress") {
        const progress = Math.max(0, Math.min(100, data?.progress || 0)) / 100;
        if (element.progressStyle === "radial") {
          const radius = Math.min(element.width, element.height) / 2 - Math.max(2, element.strokeWidth || 8) / 2;
          ctx.lineWidth = Math.max(2, element.strokeWidth || 8); ctx.lineCap = "round"; ctx.strokeStyle = element.trackFill;
          ctx.beginPath(); ctx.arc(element.x + element.width / 2, element.y + element.height / 2, radius, -.5 * Math.PI, 1.5 * Math.PI); ctx.stroke();
          ctx.strokeStyle = element.fill; ctx.beginPath(); ctx.arc(element.x + element.width / 2, element.y + element.height / 2, radius, -.5 * Math.PI, (-.5 + progress * 2) * Math.PI); ctx.stroke();
        } else if (element.progressStyle === "segmented") {
          const count = Math.max(2, element.segments || 10), gap = 3, width = (element.width - gap * (count - 1)) / count;
          for (let i = 0; i < count; i++) { ctx.fillStyle = i < Math.ceil(progress * count) ? fill : element.trackFill; ctx.beginPath(); ctx.roundRect(element.x + i * (width + gap), element.y, width, element.height, element.cornerRadius || 0); ctx.fill(); }
        } else {
          ctx.fillStyle = element.trackFill; ctx.beginPath(); ctx.roundRect(element.x, element.y, element.width, element.height, element.cornerRadius || 0); ctx.fill();
          ctx.fillStyle = fill; ctx.beginPath(); ctx.roundRect(element.x, element.y, element.width * progress, element.height, element.cornerRadius || 0); ctx.fill();
        }
      } else {
        ctx.beginPath();
        if (element.type === "ellipse") ctx.ellipse(element.x + element.width / 2, element.y + element.height / 2, Math.abs(element.width / 2), Math.abs(element.height / 2), 0, 0, Math.PI * 2);
        else if (element.type === "line") { ctx.moveTo(element.x, element.y); ctx.lineTo(element.x + element.width, element.y + element.height); ctx.strokeStyle = element.fill; ctx.lineWidth = Math.max(1, element.strokeWidth || 1); }
        else ctx.roundRect(element.x, element.y, element.width, element.height, element.cornerRadius || 0);
        if (element.type !== "line") ctx.fill(); if (element.type === "line" || element.strokeWidth > 0) ctx.stroke();
      }
      ctx.restore();
    }
  }

  function renderPreview() {
    if (!previewCanvas || !localTemplate) return;

    const activeBackground = previewBgImage || defaultBgImage;
    if (activeBackground?.naturalWidth && activeBackground?.naturalHeight) {
      if (localTemplate.outputSizeX !== activeBackground.naturalWidth ||
          localTemplate.outputSizeY !== activeBackground.naturalHeight) {
        localTemplate.outputSizeX = activeBackground.naturalWidth;
        localTemplate.outputSizeY = activeBackground.naturalHeight;
        changedSettings = changedSettings.add("template");
      }
      if (previewCanvas.width !== activeBackground.naturalWidth) previewCanvas.width = activeBackground.naturalWidth;
      if (previewCanvas.height !== activeBackground.naturalHeight) previewCanvas.height = activeBackground.naturalHeight;
    }

    const ctx = previewCanvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

    if (previewBgImage) {
      ctx.drawImage(previewBgImage, 0, 0);
    } else if (defaultBgImage) {
      const gradient = ctx.createLinearGradient(0, 0, localTemplate.outputSizeX, localTemplate.outputSizeY);
      gradient.addColorStop(0, `${canvasHex($colorStore.primary, "#3b82f6")}15`);
      gradient.addColorStop(0.5, `${canvasHex($colorStore.primary, "#3b82f6")}20`);
      gradient.addColorStop(1, `${canvasHex($colorStore.secondary, "#8b5cf6")}15`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, localTemplate.outputSizeX, localTemplate.outputSizeY);
      ctx.drawImage(defaultBgImage, 0, 0);
    }

    if (localTemplate.templateUser?.showText) {
      ctx.fillStyle = canvasHex(localTemplate.templateUser.textColor, "#ffffff");
      ctx.font = `${localTemplate.templateUser.fontSize || 24}px sans-serif`;
      ctx.fillText(
        currentUserData?.username || sampleData.username,
        localTemplate.templateUser.textX || 120,
        localTemplate.templateUser.textY || 50
      );
    }

    if (localTemplate.templateBar?.showBar) {
      const percent = (currentUserData?.progress || sampleData.progress) / 100;
      const x1 = localTemplate.templateBar.barPointAx;
      const y1 = localTemplate.templateBar.barPointAy;
      const x2 = localTemplate.templateBar.barPointBx;
      const y2 = localTemplate.templateBar.barPointBy;
      const length = (localTemplate.templateBar.barLength || 452) * percent;
      const direction = localTemplate.templateBar.barDirection ?? 3;

      let x3, x4, y3, y4;
      switch (direction) {
        case 1:
          x3 = x1; x4 = x2; y3 = y1 + length; y4 = y2 + length;
          break;
        case 0:
          x3 = x1; x4 = x2; y3 = y1 - length; y4 = y2 - length;
          break;
        case 2:
          x3 = x1 - length; x4 = x2 - length; y3 = y1; y4 = y2;
          break;
        default:
          x3 = x1 + length; x4 = x2 + length; y3 = y1; y4 = y2;
          break;
      }

      ctx.save();
      const barColor = localTemplate.templateBar.barColor || "4CAF50";
      ctx.fillStyle = canvasHex(barColor, "#4caf50", true);
      ctx.globalAlpha = (localTemplate.templateBar.barTransparency || 255) / 255;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x3, y3);
      ctx.lineTo(x4, y4);
      ctx.lineTo(x2, y2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    if (localTemplate.templateGuild?.showGuildRank) {
      ctx.fillStyle = canvasHex(localTemplate.templateGuild.guildRankColor, "#ffffff");
      ctx.font = `${localTemplate.templateGuild.guildRankFontSize || 18}px sans-serif`;
      ctx.fillText(
        String(currentUserData?.rank || sampleData.rank),
        localTemplate.templateGuild.guildRankX || 50,
        localTemplate.templateGuild.guildRankY || 150
      );
    }

    if (localTemplate.templateGuild?.showGuildLevel) {
      ctx.fillStyle = canvasHex(localTemplate.templateGuild.guildLevelColor, "#ffffff");
      ctx.font = `${localTemplate.templateGuild.guildLevelFontSize || 18}px sans-serif`;
      ctx.fillText(
        String(currentUserData?.level || sampleData.level),
        localTemplate.templateGuild.guildLevelX || 350,
        localTemplate.templateGuild.guildLevelY || 150
      );
    }

    if (localTemplate.templateUser?.showIcon) {
      const avatarUrl = currentUserData?.avatarUrl || sampleData.avatarUrl;
      if (avatarUrl) {
        let avatar = customPreviewImages.get(avatarUrl);
        if (!avatar) {
          avatar = new Image();
          avatar.crossOrigin = "anonymous";
          avatar.onload = renderPreview;
          avatar.src = avatarUrl;
          customPreviewImages.set(avatarUrl, avatar);
        }
        if (avatar.complete && avatar.naturalWidth > 0) {
          const x = localTemplate.templateUser.iconX ?? 27;
          const y = localTemplate.templateUser.iconY ?? 24;
          const width = localTemplate.templateUser.iconSizeX ?? 73;
          const height = localTemplate.templateUser.iconSizeY ?? 74;
          const radius = Math.min(width, height) / 2;
          ctx.save();
          ctx.beginPath();
          ctx.arc(x + width / 2, y + height / 2, radius, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(avatar, x, y, width, height);
          ctx.restore();
        }
      }
    }
    renderCustomPreviewElements(ctx);
  }

  onMount(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile);
    void load();

    const img = new Image();
    img.onload = () => {
      defaultBgImage = img;
      if (localTemplate && !localTemplate.customXpImageUrl &&
          (localTemplate.outputSizeX !== img.naturalWidth || localTemplate.outputSizeY !== img.naturalHeight)) {
        localTemplate.outputSizeX = img.naturalWidth;
        localTemplate.outputSizeY = img.naturalHeight;
        changedSettings = changedSettings.add("template");
      }
      renderPreview();
    };
    img.onerror = () => {
      defaultBgImage = null;
    };
    img.src = "/img/default_xp_background.png";
  });

  onDestroy(() => {
    if (browser) window.removeEventListener("resize", checkMobile);
  });

  $effect(() => {
    const current = localTemplate;
    if (!current) return;
    const url: string = current.customXpImageUrl ?? "";
    if (!url) {
      previewBgImage = null;
      previewBgUrl = "";
      renderPreview();
      return;
    }
    if (previewBgUrl === url && previewBgImage) {
      renderPreview();
      return;
    }
    const img = new Image();
    img.onload = () => {
      if (localTemplate && (localTemplate.outputSizeX !== img.naturalWidth || localTemplate.outputSizeY !== img.naturalHeight)) {
        localTemplate.outputSizeX = img.naturalWidth;
        localTemplate.outputSizeY = img.naturalHeight;
        changedSettings = changedSettings.add("template");
      }
      previewBgUrl = url;
      previewBgImage = img;
      renderPreview();
    };
    img.onerror = () => {
      previewBgImage = null;
      previewBgUrl = "";
      renderPreview();
    };
    img.src = url;
  });

  $effect(() => {
    if (previewCanvas && localTemplate) renderPreview();
  });

  const buttonStyle = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );
  const changed = $derived(changedSettings.has("template"));
</script>

<PluginCard title={m.xp.cardRankTitle()} alwaysOpen>
  {#if loading}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.common.loading()}</p>
  {:else if failed || !localTemplate}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.xp.noTemplate()}</p>
  {:else}
    <div class="rounded-xl overflow-hidden border w-full max-w-[600px] mx-auto"
         style="aspect-ratio: {localTemplate.outputSizeX} / {localTemplate.outputSizeY};
                background: {$colorStore.primary}10; border-color: {$colorStore.primary}30;">
      <canvas bind:this={previewCanvas} width={localTemplate.outputSizeX} height={localTemplate.outputSizeY}
              class="block w-full h-auto" aria-label={m.xp.previewAria()}></canvas>
    </div>

    <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium w-full sm:w-auto sm:min-w-[14rem] sm:mx-auto flex items-center justify-center gap-2"
            style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};" onclick={() => (showEditor = true)}>
      <i class="fa-solid fa-pen" aria-hidden="true"></i>{m.xp.editCard()}
    </button>

    {#if changed}
      <div class="flex flex-wrap items-center justify-end gap-2">
        <button type="button" class="px-5 rounded-xl min-h-[44px] font-medium" style={buttonStyle} onclick={resetChanges}>
          {m.xp.discardChanges()}
        </button>
        <button type="button" class="px-5 rounded-xl min-h-[44px] font-medium disabled:opacity-50"
                style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};" disabled={saving} onclick={saveTemplate}>
          {m.xp.saveCard()}
        </button>
      </div>
    {/if}

    <SettingsGroup title={m.xp.backgrounds()} bind:open={backgroundOpen} count={backgroundValue ? 1 : 0}>
      <BackgroundPicker value={backgroundValue} busy={backgroundBusy} onpick={pickBackground} onclear={clearBackground} />
    </SettingsGroup>
  {/if}
</PluginCard>

{#if showEditor && localTemplate}
  {#if isMobile}
    <XpMobileTemplateEditor bind:localTemplate bind:changedSettings bind:currentUserData bind:sampleData bind:showEditor />
  {:else}
    <XpTemplateEditor bind:localTemplate bind:changedSettings bind:currentUserData bind:sampleData bind:showEditor />
  {/if}
{/if}
