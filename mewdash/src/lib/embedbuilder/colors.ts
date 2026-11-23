import { m } from "$lib/i18n";

export function embedColorOptions() {
  return [
    { id: "#5865F2", name: m.common.blurple(), icon: "🟦" },
    { id: "#57F287", name: m.common.colorGreen(), icon: "🟩" },
    { id: "#FEE75C", name: m.embedbuilder.editorColorYellow(), icon: "🟨" },
    { id: "#ED4245", name: m.common.red(), icon: "🟥" },
    { id: "#EB459E", name: m.embedbuilder.editorColorFuchsia(), icon: "🟪" },
    { id: "#00D166", name: m.embedbuilder.editorColorBrandGreen(), icon: "💚" },
    { id: "#3498DB", name: m.common.blue(), icon: "🔵" },
    { id: "#9C59B6", name: m.embedbuilder.editorColorPurple(), icon: "🟣" },
    { id: "#E67E22", name: m.embedbuilder.editorColorOrange(), icon: "🟠" },
    { id: "#95A5A6", name: m.common.colorGrey(), icon: "⚪" },
    { id: "#000000", name: m.embedbuilder.editorColorBlack(), icon: "⚫" },
    { id: "#FFFFFF", name: m.embedbuilder.editorColorWhite(), icon: "⚪" }
  ];
}
