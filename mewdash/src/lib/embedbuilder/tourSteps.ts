import { m } from "$lib/i18n";
import type { TourStep } from "$lib/components/GuidedTour.svelte";

interface SimpleTourOptions {
  message?: boolean;
  buttons?: boolean;
  send?: boolean;
  save?: boolean;
  messageButtons?: boolean;
}

export function simpleTourSteps({ message = true, buttons = true, send = false, save = false, messageButtons = false }: SimpleTourOptions = {}): TourStep[] {
  return [
    { target: "mode", text: m.embedbuilder.tourIntro() },
    { target: "mode", text: m.embedbuilder.tourMode() },
    ...(message ? [{ target: "simple-message", text: m.embedbuilder.tourMessage() }] : []),
    { target: "simple-title", text: m.embedbuilder.tourTitle() },
    { target: "simple-description", text: m.embedbuilder.tourDescription() },
    { target: "simple-color", text: m.embedbuilder.tourColor() },
    { target: "simple-image", text: m.embedbuilder.tourImage() },
    ...(buttons ? [{ target: "simple-buttons", text: messageButtons ? m.embedbuilder.tourButtons() : m.embedbuilder.tourButtonsLink() }] : []),
    { target: "preview", text: m.embedbuilder.tourPreview() },
    ...(send ? [{ target: "simple-send", text: m.embedbuilder.tourSend() }] : []),
    ...(save ? [{ target: "save", text: m.embedbuilder.tourSave() }] : []),
    { target: "replay", text: m.embedbuilder.tourReplayStep({ button: m.embedbuilder.tourReplay() }) }
  ];
}

interface AdvancedTourOptions {
  popup?: boolean;
  components?: boolean;
  saved?: boolean;
  messageButtons?: boolean;
}

export function advancedTourSteps({ popup = false, components = true, saved = true, messageButtons = false }: AdvancedTourOptions = {}): TourStep[] {
  return [
    { target: "mode", text: m.embedbuilder.tourIntro() },
    { target: "mode", text: m.embedbuilder.tourModeAdvanced() },
    ...(popup ? [] : [
      { target: "tabs", text: m.embedbuilder.tourTabs() },
      { target: "tab-templates", text: m.embedbuilder.tourTabTemplates() }
    ]),
    { target: "tab-editor", text: m.embedbuilder.tourTabEditor() },
    ...(components ? [{ target: "tab-components", text: messageButtons ? m.embedbuilder.tourTabComponentsReply() : m.embedbuilder.tourTabComponents() }] : []),
    { target: "tab-json", text: m.embedbuilder.tourTabJson() },
    ...(saved ? [{ target: "tab-saved", text: m.embedbuilder.tourTabSaved() }] : []),
    ...(popup ? [] : [{ target: "tab-send", text: m.embedbuilder.tourTabSend() }]),
    { target: "preview", text: m.embedbuilder.tourPreview() },
    ...(popup ? [{ target: "save", text: m.embedbuilder.tourSave() }] : []),
    { target: "replay", text: m.embedbuilder.tourReplayStep({ button: m.embedbuilder.tourReplay() }) }
  ];
}
