/**
 * Type ID to Icon Name Mapping
 * 
 * Single source of truth for mapping Falling Fruit type IDs to icon names.
 * Used by both:
 * - FruitIcons.ts (for marker icons)
 * - fruitSeasons.ts (for season lookup)
 */

// Icon name type - all valid icon names
export type IconName = 
  | 'aloeVera'
  | 'apple'
  | 'avocado'
  | 'bamboo'
  | 'banana'
  | 'bitterOrange'
  | 'blackberry'
  | 'blackWalnut'
  | 'bluePassionflower'
  | 'chayote'
  | 'clementine'
  | 'collardGreens'
  | 'commonFig'
  | 'commonGuava'
  | 'dragonfruit'
  | 'fig'
  | 'grape'
  | 'grapefruit'
  | 'guava'
  | 'japanesePersimmon'
  | 'kale'
  | 'lavender'
  | 'lemon'
  | 'lime'
  | 'loquat'
  | 'olive'
  | 'orange'
  | 'papaya'
  | 'passionfruit'
  | 'peach'
  | 'pineappleSage'
  | 'pomegranate'
  | 'pricklyPear'
  | 'rose'
  | 'rosemary'
  | 'sage'
  | 'sapote'
  | 'shiso'
  | 'squash'
  | 'strawberryHedgehog'
  | 'sweetLime'
  | 'thyme'
  | 'tomato'
  | 'yellowPassionfruit';

/**
 * Map from Falling Fruit type IDs to icon names.
 * Multiple type IDs can map to the same icon.
 */
export const typeIdToIcon: Record<number, IconName> = {
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
  
  // Avocado (Persea americana)
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
  
  // Banana (Musa)
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
  
  // Blackberry (Rubus)
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
  
  // Japanese Persimmon (Diospyros)
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
  
  // Orange (Citrus x sinensis)
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
  
  // Pomegranate (Punica granatum)
  13: 'pomegranate',
  4132: 'pomegranate',
  4384: 'pomegranate',
  4629: 'pomegranate',
  4635: 'pomegranate',
  7930: 'pomegranate',
  9952: 'pomegranate',
  
  // Prickly Pear (Opuntia)
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
  
  // Strawberry Hedgehog Cactus
  1333: 'strawberryHedgehog',
  
  // Sweet lime
  771: 'sweetLime',
  
  // Thyme
  192: 'thyme',
  
  // Tomato
  61: 'tomato',
  
  // Yellow Passionfruit
  2782: 'yellowPassionfruit',
};

/**
 * Get icon name for a list of type IDs.
 * Returns the first matching icon name, or null if no match.
 */
export function getIconNameForTypes(typeIds: number[]): IconName | null {
  for (const typeId of typeIds) {
    const iconName = typeIdToIcon[typeId];
    if (iconName) {
      return iconName;
    }
  }
  return null;
}

