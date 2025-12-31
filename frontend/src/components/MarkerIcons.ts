// SVG marker icons encoded as data URIs for Mapbox
// These are loaded into the map as images and used for symbol layers

// Leaf icon (forager - edible plants)
export const leafIcon = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#22c55e" stroke="#171717" stroke-width="1.5">
  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" fill="none"/>
</svg>
`)}`;

// Flower icon (honeybee - bee forage)
export const flowerIcon = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#f59e0b" stroke="#171717" stroke-width="1.5">
  <circle cx="12" cy="12" r="3"/>
  <path d="M12 2a3 3 0 0 0 0 6 3 3 0 0 0 0-6Z"/>
  <path d="M19 9a3 3 0 0 0-5.2 3A3 3 0 0 0 19 9Z"/>
  <path d="M19 15a3 3 0 0 0-5.2-3 3 3 0 0 0 5.2 3Z"/>
  <path d="M12 22a3 3 0 0 0 0-6 3 3 0 0 0 0 6Z"/>
  <path d="M5 15a3 3 0 0 0 5.2-3A3 3 0 0 0 5 15Z"/>
  <path d="M5 9a3 3 0 0 0 5.2 3A3 3 0 0 0 5 9Z"/>
</svg>
`)}`;

// Scissors icon (grafter)
export const scissorsIcon = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a855f7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="6" cy="6" r="3"/>
  <path d="M8.12 8.12 12 12"/>
  <path d="M20 4 8.12 15.88"/>
  <circle cx="6" cy="18" r="3"/>
  <path d="M14.8 14.8 20 20"/>
</svg>
`)}`;

// Bag icon (freegan)
export const bagIcon = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#3b82f6" stroke="#171717" stroke-width="1.5">
  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
  <path d="M3 6h18" fill="none" stroke="#171717"/>
  <path d="M16 10a4 4 0 0 1-8 0" fill="none" stroke="#171717"/>
</svg>
`)}`;

// Unverified marker (warning)
export const unverifiedIcon = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#f97316" stroke="#171717" stroke-width="1.5">
  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" fill="none"/>
</svg>
`)}`;

// Generic marker for mixed/unknown categories
export const genericIcon = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#22c55e" stroke="#171717" stroke-width="1.5">
  <circle cx="12" cy="12" r="8"/>
</svg>
`)}`;

export const markerIcons = {
  leaf: leafIcon,
  flower: flowerIcon,
  scissors: scissorsIcon,
  bag: bagIcon,
  unverified: unverifiedIcon,
  generic: genericIcon,
} as const;


