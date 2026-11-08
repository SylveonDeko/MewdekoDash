import type { CardCustomType, CardImage, CardPreview, CardTemplate } from "$lib/api/cards/models";
import type { CardPresetCatalog } from "$lib/api/cardpresets/models";

/** A starter layout the designer offers. */
export interface CardStarter {
  id: string;
  name: string;
  template: CardTemplate;
}

/** What the designer is asked to draw. */
export interface CardPreviewRequest {
  /** Whether to draw the locked state */
  locked: boolean;
  /** The sample the card shows, when the feature has samples */
  sample: string | null;
  /** An element being typed over, drawn without its text */
  editingId: string | null;
}

/**
 * What a feature gives the card designer: its limits and palette, the element kinds it allows, and how it draws,
 * stores images, and starts over.
 */
export interface CardDesignerConfig {
  limits: {
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
    maxElements: number;
    maxText: number;
    nameLength?: number;
  };
  /** primary, secondary, accent, text, muted, background as hex */
  palette: Record<string, string>;
  placeholders: string[];
  images: CardImage[];
  /** The design resets and built in elements start from */
  builtIn: CardTemplate;
  /** Kinds the card keeps once each, hidden rather than removed */
  builtInTypes: string[];
  /** Kinds a design can add */
  customTypes: CardCustomType[];
  /** What new text elements say */
  newTextDefault: string;
  /** The palette names colors can use */
  tokens: string[];
  /** Whether cards have an unlocked and a locked state */
  states: boolean;
  /** Whether text can have a shadow */
  textShadows: boolean;
  /** The samples the preview can show, or empty for none */
  samples: { id: string; name: string }[];
  defaultLabel: string;
  defaultLockedLabel: string;
  /** The color the grade token stands for in the preview */
  gradeColor: (locked: boolean, sample: string | null) => string;
  /** Layouts to start from, or empty for none */
  starters: CardStarter[];
  /** Draws a design */
  preview: (template: CardTemplate, request: CardPreviewRequest) => Promise<CardPreview>;
  /** Stores an image sent as a data URI */
  uploadImage: (data: string) => Promise<CardImage>;
  /** Deletes an image */
  deleteImage: (image: CardImage) => Promise<void>;
  /** What to show for an image's URL */
  imageSrc: (url: string) => string | null;
  /** Loads the shared background presets */
  loadPresets: () => Promise<CardPresetCatalog>;
  /** Limits images to the shared presets: no uploads and no links */
  presetsOnly?: boolean;
}
