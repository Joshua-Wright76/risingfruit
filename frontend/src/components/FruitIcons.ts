// SVG fruit icons encoded as data URIs for Mapbox markers
// Uses emojis for common fruits, custom SVGs for exotic fruits without emoji equivalents
// Colors imported from centralized color system - see src/lib/colors.ts

import { fruitIcon } from '../lib/colors';
import { typeIdToIcon, getIconNameForTypes, type IconName } from '../lib/typeIdMappings';

// Helper to create data URI from SVG
const svgToDataUri = (svg: string): string =>
  `data:image/svg+xml,${encodeURIComponent(svg)}`;

// Icon size constants for high-DPI rendering
// We render at 2x resolution (80px) for crisp display on retina screens
export const ICON_SIZE = 80; // Actual pixel size of generated icons
export const ICON_DISPLAY_SIZE = 40; // CSS pixel size for display
export const ICON_PIXEL_RATIO = ICON_SIZE / ICON_DISPLAY_SIZE; // 2x for retina

// Wrap SVG content in a circle background with season-aware border
const wrapInCircle = (svgContent: string, inSeason: boolean): string => {
  const bgColor = fruitIcon.backgroundDark; // Dark mode background
  const strokeColor = inSeason ? fruitIcon.borderInSeason : fruitIcon.borderDefault;
  const strokeWidth = inSeason ? fruitIcon.borderWidthInSeason : fruitIcon.borderWidthDefault;
  return `<svg width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="35" fill="${bgColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
  <g transform="translate(8, 8)">${svgContent}</g>
</svg>`;
};

// Extract inner content from SVG (remove outer <svg> tags)
const extractSvgContent = (svg: string): string => {
  return svg
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>/, '')
    .trim();
};

// Create SVG with emoji inside circle background
// Uses sans-serif unicode font stack for consistent emoji rendering across platforms
const emojiToSvg = (emoji: string, inSeason: boolean): string => {
  const bgColor = fruitIcon.backgroundDark; // Dark mode background
  const strokeColor = inSeason ? fruitIcon.borderInSeason : fruitIcon.borderDefault;
  const strokeWidth = inSeason ? fruitIcon.borderWidthInSeason : fruitIcon.borderWidthDefault;
  return `<svg width="${ICON_SIZE}" height="${ICON_SIZE}" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="35" fill="${bgColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
  <text x="40" y="52" font-size="36" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif" text-anchor="middle">${emoji}</text>
</svg>`;
};

// Emoji mappings for icons that have good emoji equivalents (29 icons)
const emojiIcons: Record<string, string> = {
  // Direct matches
  apple: '🍎',
  avocado: '🥑',
  bamboo: '🎋',
  banana: '🍌',
  grape: '🍇',
  lemon: '🍋',
  lime: '🍋‍🟩',
  olive: '🫒',
  orange: '🍊',
  peach: '🍑',
  tomato: '🍅',
  rose: '🌹',
  kale: '🥬',
  collardGreens: '🥬',
  // Acceptable substitutes
  bitterOrange: '🍊',
  clementine: '🍊',
  sweetLime: '🍋',
  grapefruit: '🍊',
  blackberry: '🫐',
  blackWalnut: '🌰',
  pricklyPear: '🌵',
  strawberryHedgehog: '🌵',
  rosemary: '🌿',
  sage: '🌿',
  thyme: '🌿',
  pineappleSage: '🌿',
  shiso: '🌿',
  aloeVera: '🪴',
  bluePassionflower: '🌸',
};

// ============================================================
// Custom SVG definitions for exotic fruits without emoji equivalents (15 icons)
// ============================================================

// Common Fig
const commonFigSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M 32 20 Q 22 24 20 34 Q 20 44 28 48 Q 32 50 36 48 Q 44 44 44 34 Q 42 24 32 20 Z" fill="#8B6F47" stroke="#654321" stroke-width="2"/>
  <circle cx="32" cy="22" r="3" fill="#556B2F"/>
  <circle cx="30" cy="36" r="2" fill="#D2691E" opacity="0.6"/>
  <circle cx="34" cy="38" r="2" fill="#D2691E" opacity="0.6"/>
</svg>`;

// Common Guava
const commonGuavaSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="34" r="14" fill="#F0E68C" stroke="#BDB76B" stroke-width="2"/>
  <path d="M 32 20 Q 36 16 40 18" stroke="#556B2F" stroke-width="2" fill="none"/>
  <ellipse cx="38" cy="18" rx="6" ry="3" fill="#7CB342" stroke="#558B2F" stroke-width="1.5"/>
  <circle cx="32" cy="34" r="8" fill="#FFB6C1" opacity="0.5"/>
</svg>`;

// Fig
const figSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M 32 22 Q 24 24 22 32 Q 22 42 28 48 Q 32 50 36 48 Q 42 42 42 32 Q 40 24 32 22 Z" fill="#6F4E37" stroke="#5D4037" stroke-width="2"/>
  <circle cx="32" cy="24" r="2.5" fill="#8B7355"/>
  <circle cx="28" cy="34" r="1.5" fill="#CD853F" opacity="0.7"/>
  <circle cx="36" cy="36" r="1.5" fill="#CD853F" opacity="0.7"/>
</svg>`;

// Guava
const guavaSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="34" r="14" fill="#98FB98" stroke="#6B8E23" stroke-width="2"/>
  <path d="M 32 20 Q 36 16 40 18" stroke="#556B2F" stroke-width="2" fill="none"/>
  <ellipse cx="38" cy="18" rx="6" ry="3" fill="#7CB342" stroke="#558B2F" stroke-width="1.5"/>
  <circle cx="32" cy="34" r="8" fill="#FFB6C1" opacity="0.6"/>
</svg>`;

// Loquat
const loquatSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="32" cy="36" rx="12" ry="14" fill="#FFA500" stroke="#D2691E" stroke-width="2"/>
  <path d="M 32 22 Q 28 18 26 14" stroke="#228B22" stroke-width="2" fill="none"/>
  <ellipse cx="38" cy="12" rx="8" ry="4" fill="#7CB342" stroke="#558B2F" stroke-width="1.5"/>
  <ellipse cx="26" cy="14" rx="6" ry="3" fill="#7CB342" stroke="#558B2F" stroke-width="1.5"/>
</svg>`;

// Pomegranate
const pomegranateSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="34" r="16" fill="#DC143C" stroke="#8B0000" stroke-width="2"/>
  <path d="M 26 18 Q 32 14 38 18" stroke="#6B8E23" stroke-width="2" fill="none"/>
  <line x1="32" y1="18" x2="32" y2="14" stroke="#6B8E23" stroke-width="2"/>
  <circle cx="28" cy="30" r="2" fill="#FFB6C1"/>
  <circle cx="36" cy="30" r="2" fill="#FFB6C1"/>
  <circle cx="32" cy="36" r="2" fill="#FFB6C1"/>
  <circle cx="26" cy="38" r="2" fill="#FFB6C1"/>
  <circle cx="38" cy="38" r="2" fill="#FFB6C1"/>
</svg>`;

// Squash
const squashSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M 32 22 Q 24 24 22 32 Q 22 40 26 46 Q 32 50 38 46 Q 42 40 42 32 Q 40 24 32 22 Z" fill="#FFD700" stroke="#DAA520" stroke-width="2"/>
  <rect x="30" y="14" width="4" height="8" fill="#8B7355" rx="1"/>
  <path d="M 28 16 Q 24 18 22 20" stroke="#228B22" stroke-width="1.5" fill="none"/>
  <ellipse cx="22" cy="20" rx="4" ry="2.5" fill="#7CB342" stroke="#558B2F" stroke-width="1.5"/>
  <line x1="26" y1="28" x2="26" y2="44" stroke="#FFA500" stroke-width="1" opacity="0.4"/>
  <line x1="32" y1="26" x2="32" y2="46" stroke="#FFA500" stroke-width="1" opacity="0.4"/>
  <line x1="38" y1="28" x2="38" y2="44" stroke="#FFA500" stroke-width="1" opacity="0.4"/>
</svg>`;

// Chayote
const chayoteSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M 32 20 Q 24 22 20 30 Q 18 38 24 46 Q 32 50 40 46 Q 46 38 44 30 Q 40 22 32 20 Z" fill="#9ACD32" stroke="#6B8E23" stroke-width="2"/>
  <path d="M 32 20 Q 34 16 38 16" stroke="#228B22" stroke-width="2" fill="none"/>
  <path d="M 38 16 Q 40 16 42 18 Q 42 20 40 22" stroke="#228B22" stroke-width="1.5" fill="none"/>
  <line x1="26" y1="28" x2="26" y2="44" stroke="#7CB342" stroke-width="1" opacity="0.5"/>
  <line x1="30" y1="26" x2="30" y2="46" stroke="#7CB342" stroke-width="1" opacity="0.5"/>
  <line x1="34" y1="26" x2="34" y2="46" stroke="#7CB342" stroke-width="1" opacity="0.5"/>
  <line x1="38" y1="28" x2="38" y2="44" stroke="#7CB342" stroke-width="1" opacity="0.5"/>
</svg>`;

// Dragonfruit
const dragonfruitSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="32" cy="36" rx="13" ry="15" fill="#FF69B4" stroke="#C71585" stroke-width="2"/>
  <path d="M 26 20 L 28 16 L 30 20" stroke="#7CB342" stroke-width="2" fill="none"/>
  <path d="M 32 18 L 34 14 L 36 18" stroke="#7CB342" stroke-width="2" fill="none"/>
  <path d="M 38 20 L 40 16 L 42 20" stroke="#7CB342" stroke-width="2" fill="none"/>
  <circle cx="28" cy="32" r="1.5" fill="#2F4F4F"/>
  <circle cx="34" cy="30" r="1.5" fill="#2F4F4F"/>
  <circle cx="36" cy="34" r="1.5" fill="#2F4F4F"/>
  <circle cx="30" cy="38" r="1.5" fill="#2F4F4F"/>
  <circle cx="36" cy="40" r="1.5" fill="#2F4F4F"/>
  <circle cx="32" cy="44" r="1.5" fill="#2F4F4F"/>
</svg>`;

// Japanese Persimmon
const japanesePersimmonSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="36" r="14" fill="#FF8C00" stroke="#FF6347" stroke-width="2"/>
  <path d="M 26 22 L 28 20 L 32 22 L 36 20 L 38 22" stroke="#8B4513" stroke-width="2" fill="none"/>
  <circle cx="28" cy="22" r="3" fill="#7CB342" stroke="#558B2F" stroke-width="1.5"/>
  <circle cx="32" cy="22" r="3" fill="#7CB342" stroke="#558B2F" stroke-width="1.5"/>
  <circle cx="36" cy="22" r="3" fill="#7CB342" stroke="#558B2F" stroke-width="1.5"/>
  <line x1="32" y1="26" x2="32" y2="48" stroke="#CD853F" stroke-width="1" opacity="0.3"/>
  <line x1="24" y1="36" x2="40" y2="36" stroke="#CD853F" stroke-width="1" opacity="0.3"/>
</svg>`;

// Lavender
const lavenderSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <line x1="26" y1="48" x2="26" y2="26" stroke="#6B8E23" stroke-width="2"/>
  <rect x="24" y="16" width="4" height="10" fill="#9370DB" stroke="#8B008B" stroke-width="1.5" rx="2"/>
  <line x1="24" y1="18" x2="22" y2="16" stroke="#8B008B" stroke-width="1"/>
  <line x1="28" y1="18" x2="30" y2="16" stroke="#8B008B" stroke-width="1"/>
  <line x1="32" y1="48" x2="32" y2="24" stroke="#6B8E23" stroke-width="2"/>
  <rect x="30" y="14" width="4" height="10" fill="#9370DB" stroke="#8B008B" stroke-width="1.5" rx="2"/>
  <line x1="30" y1="16" x2="28" y2="14" stroke="#8B008B" stroke-width="1"/>
  <line x1="34" y1="16" x2="36" y2="14" stroke="#8B008B" stroke-width="1"/>
  <line x1="38" y1="48" x2="38" y2="26" stroke="#6B8E23" stroke-width="2"/>
  <rect x="36" y="16" width="4" height="10" fill="#9370DB" stroke="#8B008B" stroke-width="1.5" rx="2"/>
  <line x1="36" y1="18" x2="34" y2="16" stroke="#8B008B" stroke-width="1"/>
  <line x1="40" y1="18" x2="42" y2="16" stroke="#8B008B" stroke-width="1"/>
</svg>`;

// Papaya
const papayaSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="32" cy="34" rx="12" ry="16" fill="#FF8C00" stroke="#FF6347" stroke-width="2"/>
  <path d="M 32 18 Q 34 14 36 12" stroke="#228B22" stroke-width="2" fill="none"/>
  <ellipse cx="36" cy="12" rx="5" ry="2.5" fill="#7CB342" stroke="#558B2F" stroke-width="1.5"/>
  <ellipse cx="32" cy="34" rx="6" ry="10" fill="#FFB347" opacity="0.7"/>
  <circle cx="30" cy="30" r="2" fill="#2F4F4F" opacity="0.8"/>
  <circle cx="34" cy="32" r="2" fill="#2F4F4F" opacity="0.8"/>
  <circle cx="30" cy="36" r="2" fill="#2F4F4F" opacity="0.8"/>
  <circle cx="34" cy="38" r="2" fill="#2F4F4F" opacity="0.8"/>
  <circle cx="32" cy="42" r="2" fill="#2F4F4F" opacity="0.8"/>
</svg>`;

// Passionfruit (Purple)
const passionfruitSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="34" r="14" fill="#8B008B" stroke="#4B0082" stroke-width="2"/>
  <path d="M 32 20 Q 34 16 38 16" stroke="#228B22" stroke-width="2" fill="none"/>
  <ellipse cx="38" cy="16" rx="5" ry="2.5" fill="#7CB342" stroke="#558B2F" stroke-width="1.5"/>
  <circle cx="28" cy="30" r="1.5" fill="#FFD700"/>
  <circle cx="36" cy="30" r="1.5" fill="#FFD700"/>
  <circle cx="32" cy="34" r="1.5" fill="#FFD700"/>
  <circle cx="28" cy="38" r="1.5" fill="#FFD700"/>
  <circle cx="36" cy="38" r="1.5" fill="#FFD700"/>
  <circle cx="32" cy="42" r="1.5" fill="#FFD700"/>
</svg>`;

// Sapote
const sapoteSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="36" r="14" fill="#8B4513" stroke="#654321" stroke-width="2"/>
  <path d="M 32 22 Q 34 18 38 18" stroke="#228B22" stroke-width="2" fill="none"/>
  <ellipse cx="38" cy="18" rx="6" ry="3" fill="#7CB342" stroke="#558B2F" stroke-width="1.5"/>
  <ellipse cx="32" cy="36" rx="8" ry="10" fill="#CD853F" opacity="0.6"/>
  <circle cx="32" cy="38" r="4" fill="#4B3621"/>
</svg>`;

// Yellow Passionfruit
const yellowPassionfruitSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="34" r="14" fill="#FFD700" stroke="#FFA500" stroke-width="2"/>
  <path d="M 32 20 Q 34 16 38 16" stroke="#228B22" stroke-width="2" fill="none"/>
  <ellipse cx="38" cy="16" rx="5" ry="2.5" fill="#7CB342" stroke="#558B2F" stroke-width="1.5"/>
  <circle cx="28" cy="30" r="1.5" fill="#8B4513"/>
  <circle cx="36" cy="30" r="1.5" fill="#8B4513"/>
  <circle cx="32" cy="34" r="1.5" fill="#8B4513"/>
  <circle cx="28" cy="38" r="1.5" fill="#8B4513"/>
  <circle cx="36" cy="38" r="1.5" fill="#8B4513"/>
  <circle cx="32" cy="42" r="1.5" fill="#8B4513"/>
</svg>`;

// Custom SVGs mapped by name (only for icons without emoji equivalents)
const rawSvgs: Record<string, string> = {
  chayote: chayoteSvg,
  commonFig: commonFigSvg,
  commonGuava: commonGuavaSvg,
  dragonfruit: dragonfruitSvg,
  fig: figSvg,
  guava: guavaSvg,
  japanesePersimmon: japanesePersimmonSvg,
  lavender: lavenderSvg,
  loquat: loquatSvg,
  papaya: papayaSvg,
  passionfruit: passionfruitSvg,
  pomegranate: pomegranateSvg,
  sapote: sapoteSvg,
  squash: squashSvg,
  yellowPassionfruit: yellowPassionfruitSvg,
};

// All icon names (emoji icons + SVG icons)
const allIconNames = [
  // Emoji icons (29)
  ...Object.keys(emojiIcons),
  // SVG icons (15) - only add ones not already in emojiIcons
  ...Object.keys(rawSvgs).filter((name) => !emojiIcons[name]),
];

// Generate wrapped icons (white circle background)
// Uses emoji if available, otherwise falls back to SVG
const generateWrappedIcons = (inSeason: boolean): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const name of allIconNames) {
    if (emojiIcons[name]) {
      // Use emoji for icons with good emoji equivalents
      result[name] = svgToDataUri(emojiToSvg(emojiIcons[name], inSeason));
    } else if (rawSvgs[name]) {
      // Fall back to custom SVG for exotic fruits
      const content = extractSvgContent(rawSvgs[name]);
      result[name] = svgToDataUri(wrapInCircle(content, inSeason));
    }
  }
  return result;
};

// Export all fruit icons as data URIs (regular - gray border)
export const fruitIcons = generateWrappedIcons(false) as Record<string, string>;

// Export all fruit icons with green "in season" border
export const fruitIconsInSeason = generateWrappedIcons(true) as Record<string, string>;

// Default icon for fruits without specific icons (green heart emoji)
export const defaultIcon = svgToDataUri(emojiToSvg('💚', false));
export const defaultIconInSeason = svgToDataUri(emojiToSvg('💚', true));

// Icon names for type checking
export type FruitIconName = IconName;

// Re-export from centralized type mappings
export { typeIdToIcon };

// Get icon name for a location based on its type IDs
export function getIconForTypes(typeIds: number[]): FruitIconName | null {
  return getIconNameForTypes(typeIds);
}
