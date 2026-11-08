import type { CardImage, CardTemplate } from "../cards/models";

/** Which kind of message a card belongs to */
export type WelcomeCardTarget = "greet" | "bye" | "dmgreet" | "boost" | "rolegreet" | "afk";

/** Where a message's card appears */
export type CardPlacement = "None" | "EmbedImage" | "Attached";

/** The limits a welcome card design is held to */
export interface WelcomeCardLimits {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  maxElements: number;
  maxText: number;
  maxImages: number;
}

/**
 * The card of one message and what the designer needs
 * Maps to Mewdeko.Controllers.Common.WelcomeCards.WelcomeCardResponse
 */
export interface WelcomeCard {
  placement: CardPlacement;
  template: CardTemplate;
  /** The classic layout, which resets start from */
  builtIn: CardTemplate;
  /** The server's stored images, oldest first; url is a small data URI */
  images: CardImage[];
  placeholders: string[];
  /** primary, secondary, accent, text, muted, background as hex */
  palette: Record<string, string>;
  limits: WelcomeCardLimits;
}

/** A ready made layout to start from */
export interface WelcomeCardStarter {
  id: string;
  name: string;
  template: CardTemplate;
}
