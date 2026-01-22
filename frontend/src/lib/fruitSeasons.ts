// Fallback season data for fruit types when location-specific season is unknown
// Based on USDA harvest data and horticultural sources for US growing regions

import { typeIdToIcon } from './typeIdMappings';

export interface SeasonData {
  start: string;
  stop: string;
}

// Map from icon name (as used in FruitIcons.ts) to typical PEAK harvest season
// These are the best months to actually find ripe fruit for foraging
export const fruitSeasons: Record<string, SeasonData> = {
  // Fruits - Peak harvest seasons for foraging
  apple: { start: 'September', stop: 'November' }, // Fall apple harvest
  avocado: { start: 'April', stop: 'August' }, // Hass peak in California
  banana: { start: 'June', stop: 'October' }, // Peak fruiting in warm climates
  bitterOrange: { start: 'January', stop: 'March' }, // Seville orange peak
  blackberry: { start: 'June', stop: 'August' }, // Summer berry season
  clementine: { start: 'November', stop: 'January' }, // Peak citrus season
  commonFig: { start: 'August', stop: 'October' }, // Main crop peak
  commonGuava: { start: 'August', stop: 'October' }, // Peak fruiting
  dragonfruit: { start: 'June', stop: 'September' }, // Summer fruiting
  fig: { start: 'August', stop: 'October' }, // Main crop peak
  grape: { start: 'August', stop: 'October' }, // Peak harvest
  grapefruit: { start: 'December', stop: 'March' }, // Peak citrus sweetness
  guava: { start: 'August', stop: 'October' }, // Peak fruiting
  japanesePersimmon: { start: 'October', stop: 'December' }, // Fall fruit
  lemon: { start: 'November', stop: 'March' }, // Peak winter citrus
  lime: { start: 'May', stop: 'September' }, // Peak summer production
  loquat: { start: 'April', stop: 'June' }, // Spring harvest
  olive: { start: 'October', stop: 'December' }, // Peak harvest
  orange: { start: 'December', stop: 'March' }, // Peak winter citrus
  papaya: { start: 'June', stop: 'September' }, // Summer fruiting in tropical climates
  passionfruit: { start: 'July', stop: 'September' }, // Summer to early fall
  peach: { start: 'June', stop: 'August' }, // Peak summer stone fruit
  pomegranate: { start: 'September', stop: 'November' }, // Fall harvest
  sapote: { start: 'September', stop: 'December' }, // Fall harvest
  sweetLime: { start: 'December', stop: 'February' }, // Winter citrus peak
  tomato: { start: 'July', stop: 'September' }, // Peak summer
  yellowPassionfruit: { start: 'July', stop: 'September' }, // Same as passionfruit
  bluePassionflower: { start: 'July', stop: 'September' }, // Summer fruiting

  // Nuts
  blackWalnut: { start: 'September', stop: 'October' }, // Fall nut drop

  // Vegetables/Greens - best eating quality
  bamboo: { start: 'March', stop: 'May' }, // Spring shoots
  chayote: { start: 'October', stop: 'December' }, // Fall harvest
  collardGreens: { start: 'October', stop: 'February' }, // Best after frost
  kale: { start: 'October', stop: 'February' }, // Sweetest after frost
  squash: { start: 'August', stop: 'October' }, // Summer/winter squash peak

  // Herbs - peak flavor before flowering
  aloeVera: { start: 'March', stop: 'May' }, // Spring growth
  lavender: { start: 'June', stop: 'August' }, // Summer bloom
  pineappleSage: { start: 'April', stop: 'June' }, // Before flowering
  rose: { start: 'May', stop: 'June' }, // Peak bloom for petals; Sept-Oct for hips
  rosemary: { start: 'April', stop: 'June' }, // Best before flowering
  sage: { start: 'April', stop: 'June' }, // Before flowering
  shiso: { start: 'July', stop: 'September' }, // Summer leaves
  thyme: { start: 'May', stop: 'July' }, // Before flowering

  // Cactus
  pricklyPear: { start: 'August', stop: 'October' }, // Late summer fruit (tunas)
  strawberryHedgehog: { start: 'April', stop: 'June' }, // Spring fruit
};

/**
 * Get fallback season data for a list of type IDs
 * Returns the season for the first matching type that has season data
 */
export function getFallbackSeason(typeIds: number[]): SeasonData | null {
  for (const typeId of typeIds) {
    const iconName = typeIdToIcon[typeId];
    if (iconName && fruitSeasons[iconName]) {
      return fruitSeasons[iconName];
    }
  }
  return null;
}

/**
 * Format fallback season as a display string
 */
export function formatFallbackSeason(season: SeasonData): string {
  return `${season.start} – ${season.stop}`;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Check if a season range includes the current month
 */
export function isMonthInSeason(startMonth: string, stopMonth: string): boolean {
  const currentMonthIndex = new Date().getMonth();
  const startIndex = MONTHS.indexOf(startMonth);
  const stopIndex = MONTHS.indexOf(stopMonth);
  
  if (startIndex === -1 || stopIndex === -1) return true; // Default to in-season if month is invalid
  
  // Handle wrap-around seasons (e.g., Nov-Feb)
  if (startIndex <= stopIndex) {
    return currentMonthIndex >= startIndex && currentMonthIndex <= stopIndex;
  } else {
    return currentMonthIndex >= startIndex || currentMonthIndex <= stopIndex;
  }
}

/**
 * Check if a location is currently in season.
 * Priority: 
 * 1. Explicit season_start/season_stop from the location record
 * 2. Fallback peak season data based on the fruit type icon
 */
export function isLocationInSeason(loc: { 
  season_start?: string | null; 
  season_stop?: string | null; 
  type_ids: number[];
}): boolean {
  // 1. Check explicit season info if available
  if (loc.season_start || loc.season_stop) {
    return isMonthInSeason(
      loc.season_start || 'January', 
      loc.season_stop || 'December'
    );
  }

  // 2. Fallback to type-based season data
  return areTypeIdsInSeason(loc.type_ids);
}

/**
 * Check if a fruit type (by icon name) is currently in peak season
 */
export function isIconInSeason(iconName: string): boolean {
  const season = fruitSeasons[iconName];
  if (!season) return false;
  return isMonthInSeason(season.start, season.stop);
}

/**
 * Check if any of the given type IDs are currently in season.
 * Returns true if:
 * 1. Any type is explicitly known to be in season right now.
 * 2. Any type has NO known season data (we assume it's "possibly" in season).
 * Returns false only if ALL types are known and ALL are out of season.
 */
export function areTypeIdsInSeason(typeIds: number[]): boolean {
  if (typeIds.length === 0) return true;

  let allKnownAndOutOfSeason = true;
  let foundAnyKnownType = false;

  for (const typeId of typeIds) {
    const iconName = typeIdToIcon[typeId];
    if (iconName && fruitSeasons[iconName]) {
      foundAnyKnownType = true;
      if (isIconInSeason(iconName)) {
        return true; // Found one that IS in season
      }
    } else {
      // Unknown type or no season data for it - we can't say it's out of season
      allKnownAndOutOfSeason = false;
    }
  }

  if (!foundAnyKnownType) return true; // No season data for any types
  return !allKnownAndOutOfSeason;
}

