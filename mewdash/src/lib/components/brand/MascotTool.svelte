<svelte:options namespace="svg" />

<script lang="ts" module>
  import type { MascotToolName } from "./mascotGeometry";

  /** The box each tool is drawn in, for showing one alone as an icon. */
  export const TOOL_VIEWBOX: Record<MascotToolName, string> = {
    wrench: "-30 -96 60 106",
    bubble: "-46 -40 92 86",
    shield: "-32 -32 64 72",
    star: "-40 -40 80 78",
    note: "-24 -68 68 88",
    gift: "-36 -54 72 84",
    coins: "-34 -36 74 58",
    clipboard: "-32 -46 64 84",
    chart: "-40 -36 80 70",
    pin: "-24 -48 48 82",
    paw: "-34 -36 68 72",
    tag: "-32 -26 68 60",
    cake: "-34 -48 68 82",
    bell: "-36 -32 72 72",
    mic: "-28 -42 56 78",
    dice: "-34 -34 68 68",
    clock: "-34 -34 68 68",
    bulb: "-30 -38 60 72"
  };
</script>

<script lang="ts">
  /**
   * One of the mascot's tools, drawn around its own origin so a tail can carry it and a card can show it
   * alone.
   */
  interface Props {
    tool: MascotToolName;
  }

  let { tool }: Props = $props();

  const INK = "#1b2238";
</script>

{#if tool === "wrench"}
  <rect x="-7" y="-50" width="14" height="54" rx="6" fill="#b9c3dc" stroke={INK} stroke-width="6" />
  <path d="M-8 -79 a16 16 0 1 0 16 0" fill="none" stroke={INK} stroke-width="21" stroke-linecap="round" />
  <path d="M-8 -79 a16 16 0 1 0 16 0" fill="none" stroke="#b9c3dc" stroke-width="10" stroke-linecap="round" />
  <rect x="-4" y="-52" width="8" height="10" fill="#b9c3dc" />
{:else if tool === "bubble"}
  <rect x="-38" y="-32" width="76" height="52" rx="18" fill="#ffffff" stroke={INK} stroke-width="6" />
  <path d="M-14 18 L-22 38 L4 20 Z" fill="#ffffff" stroke={INK} stroke-width="6" stroke-linejoin="round" />
  <rect x="-22" y="8" width="28" height="12" fill="#ffffff" stroke="none" />
  <circle cx="-17" cy="-6" r="5.500" fill={INK} />
  <circle cx="0" cy="-6" r="5.500" fill={INK} />
  <circle cx="17" cy="-6" r="5.500" fill={INK} />
{:else if tool === "shield"}
  <path d="M-24 -24 L24 -24 L24 2 Q24 24 0 32 Q-24 24 -24 2 Z" fill="#5ad1ff" stroke={INK} stroke-width="6" stroke-linejoin="round" />
  <path d="M-10 0 L-2 9 L12 -9" fill="none" stroke={INK} stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
{:else if tool === "star"}
  <path d="M0 -32 L9 -11 L32 -9 L14 6 L20 30 L0 17 L-20 30 L-14 6 L-32 -9 L-9 -11 Z" fill="#ffd166" stroke={INK} stroke-width="6" stroke-linejoin="round" />
{:else if tool === "note"}
  <path d="M13 -4 L13 -56 Q36 -52 34 -28" fill="none" stroke={INK} stroke-width="13" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M13 -4 L13 -56 Q36 -52 34 -28" fill="none" stroke="#ff8fb1" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
  <ellipse cx="0" cy="0" rx="15" ry="11" transform="rotate(-20)" fill="#ff8fb1" stroke={INK} stroke-width="6" />
{:else if tool === "gift"}
  <rect x="-22" y="-12" width="44" height="32" rx="4" fill="#3df2c0" stroke={INK} stroke-width="6" />
  <rect x="-27" y="-24" width="54" height="14" rx="4" fill="#3df2c0" stroke={INK} stroke-width="6" />
  <path d="M0 -24 L0 20" stroke={INK} stroke-width="6" />
  <path d="M0 -26 C -18 -46 -26 -26 0 -26 C 26 -26 18 -46 0 -26" fill="#ff8fb1" stroke={INK} stroke-width="5" stroke-linejoin="round" />
{:else if tool === "coins"}
  <ellipse cx="0" cy="4" rx="25" ry="10" fill="#e0a92e" stroke={INK} stroke-width="6" />
  <ellipse cx="0" cy="-4" rx="25" ry="10" fill="#ffd166" stroke={INK} stroke-width="6" />
  <ellipse cx="3" cy="-12" rx="25" ry="10" fill="#e0a92e" stroke={INK} stroke-width="6" />
  <ellipse cx="3" cy="-20" rx="25" ry="10" fill="#ffd166" stroke={INK} stroke-width="6" />
  <ellipse cx="3" cy="-20" rx="12" ry="4" fill="none" stroke="#e0a92e" stroke-width="3" />
{:else if tool === "clipboard"}
  <rect x="-23" y="-30" width="46" height="60" rx="7" fill="#f6f1e4" stroke={INK} stroke-width="6" />
  <rect x="-11" y="-38" width="22" height="14" rx="5" fill="#b9c3dc" stroke={INK} stroke-width="5" />
  <path d="M-12 -8 L12 -8 M-12 4 L12 4 M-12 16 L4 16" stroke={INK} stroke-width="4.500" stroke-linecap="round" />
{:else if tool === "chart"}
  <rect x="-27" y="2" width="15" height="22" rx="3" fill="#5ad1ff" stroke={INK} stroke-width="5" />
  <rect x="-8" y="-12" width="15" height="36" rx="3" fill="#ff8fb1" stroke={INK} stroke-width="5" />
  <rect x="11" y="-28" width="15" height="52" rx="3" fill="#3df2c0" stroke={INK} stroke-width="5" />
  <path d="M-34 26 L34 26" stroke={INK} stroke-width="6" stroke-linecap="round" />
{:else if tool === "pin"}
  <path d="M0 -4 L0 26" stroke={INK} stroke-width="6" stroke-linecap="round" />
  <rect x="-11" y="-10" width="22" height="10" rx="4" fill="#ff8fb1" stroke={INK} stroke-width="5" />
  <circle cx="0" cy="-25" r="16" fill="#ff6b8b" stroke={INK} stroke-width="6" />
  <path d="M-8 -30 a10 10 0 0 1 8 -6" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" />
{:else if tool === "paw"}
  <ellipse cx="0" cy="0" rx="27" ry="28" fill="#fff1d6" stroke={INK} stroke-width="6" />
  <ellipse cx="0" cy="9" rx="11" ry="9" fill="#ff8fb1" />
  <circle cx="-13" cy="-7" r="5.500" fill="#ff8fb1" />
  <circle cx="0" cy="-13" r="5.500" fill="#ff8fb1" />
  <circle cx="13" cy="-7" r="5.500" fill="#ff8fb1" />
{:else if tool === "tag"}
  <path d="M-26 -18 L6 -18 L30 4 L6 26 L-26 26 Z" fill="#5ad1ff" stroke={INK} stroke-width="6" stroke-linejoin="round" />
  <circle cx="-13" cy="4" r="6" fill={INK} />
{:else if tool === "cake"}
  <rect x="-3.500" y="-30" width="7" height="20" rx="2" fill="#5ad1ff" stroke={INK} stroke-width="4" />
  <ellipse cx="0" cy="-36" rx="4.500" ry="7" fill="#ffd166" stroke={INK} stroke-width="3.500" />
  <rect x="-27" y="-2" width="54" height="28" rx="6" fill="#ff8fb1" stroke={INK} stroke-width="6" />
  <path d="M-27 2 Q-27 -12 -14 -12 L14 -12 Q27 -12 27 2 Q18 12 9 2 Q0 12 -9 2 Q-18 12 -27 2 Z" fill="#fff1d6" stroke={INK} stroke-width="5" stroke-linejoin="round" />
{:else if tool === "bell"}
  <circle cx="0" cy="24" r="7" fill="#e0a92e" stroke={INK} stroke-width="5" />
  <path d="M-22 14 Q-22 -24 0 -26 Q22 -24 22 14 L29 21 L-29 21 Z" fill="#ffd166" stroke={INK} stroke-width="6" stroke-linejoin="round" />
{:else if tool === "mic"}
  <path d="M-20 -10 Q-20 14 0 14 Q20 14 20 -10 M0 14 L0 27 M-13 27 L13 27" fill="none" stroke={INK} stroke-width="6" stroke-linecap="round" />
  <rect x="-12" y="-36" width="24" height="40" rx="12" fill="#b9c3dc" stroke={INK} stroke-width="6" />
  <path d="M-5 -26 L5 -26 M-5 -18 L5 -18" stroke={INK} stroke-width="3.500" stroke-linecap="round" />
{:else if tool === "dice"}
  <g transform="rotate(-8)">
    <rect x="-25" y="-25" width="50" height="50" rx="11" fill="#ffffff" stroke={INK} stroke-width="6" />
    <circle cx="-11" cy="-11" r="4.500" fill={INK} />
    <circle cx="11" cy="-11" r="4.500" fill={INK} />
    <circle cx="0" cy="0" r="4.500" fill={INK} />
    <circle cx="-11" cy="11" r="4.500" fill={INK} />
    <circle cx="11" cy="11" r="4.500" fill={INK} />
  </g>
{:else if tool === "clock"}
  <circle cx="0" cy="0" r="26" fill="#ffffff" stroke={INK} stroke-width="6" />
  <path d="M0 -15 L0 0 L11 8" fill="none" stroke={INK} stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
{:else}
  <rect x="-10" y="12" width="20" height="14" rx="4" fill="#b9c3dc" stroke={INK} stroke-width="5" />
  <circle cx="0" cy="-8" r="23" fill="#ffd166" stroke={INK} stroke-width="6" />
  <path d="M-8 -14 a12 12 0 0 1 9 -8" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" />
{/if}
