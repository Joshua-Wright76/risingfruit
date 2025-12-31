// Fallback season data for fruit types when location-specific season is unknown
// Based on USDA harvest data and horticultural sources for US growing regions

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

// Map type IDs to icon names (mirrors typeIdToIcon from FruitIcons.ts)
// This allows lookup of season data by type ID
const typeIdToIconName: Record<number, string> = {
  // Aloe Vera
  709: 'aloeVera',
  772: 'aloeVera',
  // Apple (Malus)
  14: 'apple',
  114: 'apple',
  270: 'apple',
  331: 'apple',
  351: 'apple',
  402: 'apple',
  403: 'apple',
  416: 'apple',
  1566: 'apple',
  1874: 'apple',
  2006: 'apple',
  2156: 'apple',
  2194: 'apple',
  3177: 'apple',
  // Avocado
  7: 'avocado',
  3363: 'avocado',
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
  160: 'banana',
  1982: 'banana',
  2985: 'banana',
  5719: 'banana',
  7655: 'banana',
  7871: 'banana',
  8361: 'banana',
  // Bitter orange
  81: 'bitterOrange',
  // Blackberry
  48: 'blackberry',
  1741: 'blackberry',
  1886: 'blackberry',
  1986: 'blackberry',
  2711: 'blackberry',
  // Black walnut
  111: 'blackWalnut',
  3724: 'blackWalnut',
  // Blue passionflower
  2785: 'bluePassionflower',
  // Chayote
  518: 'chayote',
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
  // Dragonfruit
  1496: 'dragonfruit',
  // Fig
  445: 'fig',
  // Grape
  16: 'grape',
  629: 'grape',
  753: 'grape',
  7515: 'grape',
  7677: 'grape',
  8548: 'grape',
  8549: 'grape',
  8668: 'grape',
  8669: 'grape',
  8934: 'grape',
  8935: 'grape',
  // Grapefruit
  5: 'grapefruit',
  6176: 'grapefruit',
  // Guava
  76: 'guava',
  // Japanese Persimmon
  12: 'japanesePersimmon',
  246: 'japanesePersimmon',
  280: 'japanesePersimmon',
  462: 'japanesePersimmon',
  941: 'japanesePersimmon',
  2120: 'japanesePersimmon',
  // Kale
  50: 'kale',
  // Lavender
  17: 'lavender',
  918: 'lavender',
  1623: 'lavender',
  // Lemon
  4: 'lemon',
  459: 'lemon',
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
  5725: 'orange',
  5733: 'orange',
  6177: 'orange',
  7594: 'orange',
  // Papaya
  222: 'papaya',
  // Passionfruit
  78: 'passionfruit',
  1553: 'passionfruit',
  8877: 'passionfruit',
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
  4132: 'pomegranate',
  4384: 'pomegranate',
  4629: 'pomegranate',
  4635: 'pomegranate',
  7930: 'pomegranate',
  9952: 'pomegranate',
  // Prickly Pear
  56: 'pricklyPear',
  1956: 'pricklyPear',
  // Rose
  82: 'rose',
  // Rosemary
  10: 'rosemary',
  // Sage
  9: 'sage',
  // Sapote
  95: 'sapote',
  708: 'sapote',
  775: 'sapote',
  2773: 'sapote',
  // Shiso
  5568: 'shiso',
  // Squash
  65: 'squash',
  // Strawberry Hedgehog
  1333: 'strawberryHedgehog',
  // Sweet lime
  771: 'sweetLime',
  // Thyme
  192: 'thyme',
  // Tomato
  61: 'tomato',
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
 * Check if a fruit type (by icon name) is currently in peak season
 */
export function isIconInSeason(iconName: string): boolean {
  const season = fruitSeasons[iconName];
  if (!season) return false;
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

