// Fallback season data for fruit types when location-specific season is unknown
// Based on USDA harvest data and horticultural sources for US growing regions

export interface SeasonData {
  start: string;
  stop: string;
  yearRound?: boolean;
}

// Map from icon name (as used in FruitIcons.ts) to typical harvest season
export const fruitSeasons: Record<string, SeasonData> = {
  // Fruits
  avocado: { start: 'March', stop: 'September', yearRound: true },
  banana: { start: 'January', stop: 'December', yearRound: true },
  bitterOrange: { start: 'January', stop: 'March' },
  clementine: { start: 'November', stop: 'February' },
  commonFig: { start: 'June', stop: 'October' },
  commonGuava: { start: 'January', stop: 'December', yearRound: true },
  fig: { start: 'June', stop: 'October' },
  grape: { start: 'July', stop: 'October' },
  grapefruit: { start: 'November', stop: 'May' },
  guava: { start: 'January', stop: 'December', yearRound: true },
  lemon: { start: 'January', stop: 'December', yearRound: true },
  lime: { start: 'January', stop: 'December', yearRound: true },
  loquat: { start: 'March', stop: 'June' },
  olive: { start: 'September', stop: 'December' },
  orange: { start: 'December', stop: 'April' },
  peach: { start: 'May', stop: 'September' },
  pomegranate: { start: 'September', stop: 'November' },
  sweetLime: { start: 'November', stop: 'March' },
  bluePassionflower: { start: 'July', stop: 'September' },

  // Nuts
  blackWalnut: { start: 'September', stop: 'October' },

  // Vegetables/Greens
  bamboo: { start: 'March', stop: 'May' },
  collardGreens: { start: 'September', stop: 'April' },
  kale: { start: 'September', stop: 'April' },
  squash: { start: 'June', stop: 'October' },

  // Herbs (mostly year-round but best in growing season)
  pineappleSage: { start: 'May', stop: 'October' },
  rose: { start: 'May', stop: 'October' },
  rosemary: { start: 'January', stop: 'December', yearRound: true },
  sage: { start: 'May', stop: 'October' },
  shiso: { start: 'June', stop: 'September' },
  thyme: { start: 'May', stop: 'October' },

  // Cactus
  strawberryHedgehog: { start: 'April', stop: 'June' },
};

// Map type IDs to icon names (mirrors typeIdToIcon from FruitIcons.ts)
// This allows lookup of season data by type ID
const typeIdToIconName: Record<number, string> = {
  // Avocado
  7: 'avocado',
  4631: 'avocado',
  4632: 'avocado',
  4641: 'avocado',
  4642: 'avocado',
  4651: 'avocado',
  5717: 'avocado',
  // Bamboo
  161: 'bamboo',
  997: 'bamboo',
  // Banana
  75: 'banana',
  1982: 'banana',
  5719: 'banana',
  // Bitter orange
  81: 'bitterOrange',
  // Black walnut
  111: 'blackWalnut',
  3724: 'blackWalnut',
  // Blue passionflower
  2785: 'bluePassionflower',
  // Clementine
  1584: 'clementine',
  // Collard greens
  3190: 'collardGreens',
  // Common fig
  20: 'commonFig',
  3153: 'commonFig',
  3793: 'commonFig',
  4390: 'commonFig',
  4535: 'commonFig',
  4557: 'commonFig',
  4634: 'commonFig',
  4640: 'commonFig',
  4646: 'commonFig',
  4648: 'commonFig',
  6151: 'commonFig',
  8470: 'commonFig',
  9283: 'commonFig',
  9669: 'commonFig',
  9879: 'commonFig',
  9982: 'commonFig',
  8945: 'commonFig',
  // Common guava
  458: 'commonGuava',
  8682: 'commonGuava',
  // Fig
  445: 'fig',
  // Grape
  16: 'grape',
  8549: 'grape',
  8668: 'grape',
  8669: 'grape',
  // Grapefruit
  5: 'grapefruit',
  6176: 'grapefruit',
  // Guava
  76: 'guava',
  // Kale
  50: 'kale',
  // Lemon
  4: 'lemon',
  5097: 'lemon',
  // Lime
  26: 'lime',
  // Loquat
  18: 'loquat',
  4638: 'loquat',
  4639: 'loquat',
  4649: 'loquat',
  4650: 'loquat',
  4654: 'loquat',
  // Olive
  59: 'olive',
  5070: 'olive',
  6179: 'olive',
  7874: 'olive',
  7888: 'olive',
  10610: 'olive',
  // Orange
  3: 'orange',
  5071: 'orange',
  5733: 'orange',
  7594: 'orange',
  // Peach
  52: 'peach',
  4519: 'peach',
  4526: 'peach',
  4643: 'peach',
  4644: 'peach',
  4647: 'peach',
  4652: 'peach',
  4765: 'peach',
  8675: 'peach',
  10008: 'peach',
  10015: 'peach',
  // Pineapple sage
  5570: 'pineappleSage',
  // Pomegranate
  13: 'pomegranate',
  4384: 'pomegranate',
  4629: 'pomegranate',
  4635: 'pomegranate',
  // Rose
  82: 'rose',
  // Rosemary
  10: 'rosemary',
  // Sage
  9: 'sage',
  // Shiso
  5568: 'shiso',
  // Squash
  65: 'squash',
  // Sweet lime
  771: 'sweetLime',
  // Thyme
  192: 'thyme',
};

/**
 * Get fallback season data for a list of type IDs
 * Returns the season for the first matching type that has season data
 */
export function getFallbackSeason(typeIds: number[]): SeasonData | null {
  for (const typeId of typeIds) {
    const iconName = typeIdToIconName[typeId];
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
  if (season.yearRound) {
    return 'Year-round';
  }
  return `${season.start} – ${season.stop}`;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Check if a season range includes the current month
 */
function isMonthInSeason(startMonth: string, stopMonth: string): boolean {
  const currentMonthIndex = new Date().getMonth();
  const startIndex = MONTHS.indexOf(startMonth);
  const stopIndex = MONTHS.indexOf(stopMonth);
  
  if (startIndex === -1 || stopIndex === -1) return false;
  
  // Handle wrap-around seasons (e.g., Nov-Feb)
  if (startIndex <= stopIndex) {
    return currentMonthIndex >= startIndex && currentMonthIndex <= stopIndex;
  } else {
    return currentMonthIndex >= startIndex || currentMonthIndex <= stopIndex;
  }
}

/**
 * Check if a fruit type (by icon name) is currently in season
 */
export function isIconInSeason(iconName: string): boolean {
  const season = fruitSeasons[iconName];
  if (!season) return false;
  if (season.yearRound) return true;
  return isMonthInSeason(season.start, season.stop);
}

/**
 * Check if any of the given type IDs are currently in season
 * Uses the fallback season data based on fruit type
 */
export function areTypeIdsInSeason(typeIds: number[]): boolean {
  for (const typeId of typeIds) {
    const iconName = typeIdToIconName[typeId];
    if (iconName && isIconInSeason(iconName)) {
      return true;
    }
  }
  return false;
}

