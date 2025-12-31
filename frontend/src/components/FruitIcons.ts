// SVG fruit icons encoded as data URIs for Mapbox markers
// Generated from custom fruit icon set

// Helper to create data URI from SVG
const svgToDataUri = (svg: string): string =>
  `data:image/svg+xml,${encodeURIComponent(svg)}`;

// Wrap SVG content in a white circle background with optional green border
const wrapInCircle = (svgContent: string, inSeason: boolean): string => {
  const strokeColor = inSeason ? '#22c55e' : '#6b7280'; // primary-500 or gray-500
  const strokeWidth = inSeason ? '5' : '3';
  return `<svg width="40" height="40" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="40" r="35" fill="white" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
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

// Avocado
const avocadoSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M 32 18 Q 22 22 20 34 Q 20 46 32 50 Q 44 46 44 34 Q 42 22 32 18 Z" fill="#6B8E23" stroke="#556B2F" stroke-width="2"/>
  <circle cx="32" cy="36" r="6" fill="#8B4513" stroke="#654321" stroke-width="2"/>
  <circle cx="32" cy="36" r="3" fill="#D2B48C"/>
</svg>`;

// Bamboo
const bambooSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="28" y="14" width="8" height="14" fill="#90EE90" stroke="#228B22" stroke-width="2" rx="1"/>
  <rect x="28" y="30" width="8" height="14" fill="#7CFC00" stroke="#228B22" stroke-width="2" rx="1"/>
  <rect x="28" y="46" width="8" height="6" fill="#90EE90" stroke="#228B22" stroke-width="2" rx="1"/>
  <line x1="28" y1="28" x2="36" y2="28" stroke="#228B22" stroke-width="2"/>
  <line x1="28" y1="44" x2="36" y2="44" stroke="#228B22" stroke-width="2"/>
</svg>`;

// Banana
const bananaSvg = `export function Banana() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Bunch of 3 bananas */}
      {/* Left banana */}
      <path d="M 28 20 Q 22 24 20 32 Q 19 40 22 46 Q 24 46 26 44 Q 28 36 28 28 Q 28 24 28 20 Z" fill="#FFD700" stroke="#FFA500" strokeWidth="2"/>
      
      {/* Center banana */}
      <path d="M 32 18 Q 28 22 26 30 Q 25 38 28 46 Q 30 46 32 44 Q 34 36 34 26 Q 34 22 32 18 Z" fill="#FFED4E" stroke="#FFA500" strokeWidth="2"/>
      
      {/* Right banana */}
      <path d="M 36 20 Q 34 24 34 32 Q 34 40 38 46 Q 40 46 42 44 Q 44 36 42 28 Q 40 24 36 20 Z" fill="#FFD700" stroke="#FFA500" strokeWidth="2"/>
      
      {/* Stem at top */}
      <ellipse cx="32" cy="18" rx="6" ry="3" fill="#8B7355" stroke="#654321" strokeWidth="1.5"/>
      
      {/* Darker edges on bananas */}
      <line x1="28" y1="24" x2="26" y2="42" stroke="#FFA500" strokeWidth="1" opacity="0.5"/>
      <line x1="32" y1="22" x2="30" y2="44" stroke="#FFA500" strokeWidth="1" opacity="0.5"/>
      <line x1="38" y1="24" x2="40" y2="42" stroke="#FFA500" strokeWidth="1" opacity="0.5"/>
    </svg>
  );
}`;

// Bitter Orange
const bitterOrangeSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="34" r="15" fill="#FF8C00" stroke="#FF4500" stroke-width="2"/>
  <rect x="30" y="17" width="4" height="5" fill="#228B22" rx="1"/>
  <ellipse cx="32" cy="17" rx="4" ry="2" fill="#7CB342"/>
  <circle cx="32" cy="34" r="2" fill="#FFE4B5" opacity="0.8"/>
</svg>`;

// Black Walnut
const blackWalnutSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="34" r="13" fill="#8B4513" stroke="#654321" stroke-width="2"/>
  <path d="M 25 27 Q 32 20 39 27" stroke="#654321" stroke-width="1.5" fill="none"/>
  <path d="M 25 41 Q 32 48 39 41" stroke="#654321" stroke-width="1.5" fill="none"/>
  <line x1="25" y1="27" x2="25" y2="41" stroke="#654321" stroke-width="1.5"/>
  <line x1="39" y1="27" x2="39" y2="41" stroke="#654321" stroke-width="1.5"/>
</svg>`;

// Blue Passionflower
const bluePassionflowerSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="18" fill="#E6E6FA" stroke="#4169E1" stroke-width="2"/>
  <circle cx="32" cy="32" r="12" fill="#9370DB" opacity="0.4"/>
  <circle cx="32" cy="32" r="6" fill="#4169E1"/>
  <circle cx="32" cy="32" r="3" fill="#FFD700" stroke="#FFA500" stroke-width="1"/>
</svg>`;

// Clementine
const clementineSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="34" r="15" fill="#FF8C00" stroke="#FF6347" stroke-width="2"/>
  <path d="M 32 19 L 34 16 L 36 19" stroke="#228B22" stroke-width="2" fill="none"/>
  <circle cx="32" cy="34" r="2" fill="#FFE4B5" opacity="0.8"/>
</svg>`;

// Collard Greens
const collardGreensSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M 32 48 Q 24 42 22 32 Q 22 22 28 16 Q 32 20 32 28 Z" fill="#2E7D32" stroke="#1B5E20" stroke-width="2"/>
  <path d="M 32 48 Q 40 42 42 32 Q 42 22 36 16 Q 32 20 32 28 Z" fill="#388E3C" stroke="#1B5E20" stroke-width="2"/>
</svg>`;

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

// Grape
const grapeSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="42" r="5" fill="#8B008B" stroke="#4B0082" stroke-width="1.5"/>
  <circle cx="26" cy="36" r="5" fill="#8B008B" stroke="#4B0082" stroke-width="1.5"/>
  <circle cx="38" cy="36" r="5" fill="#8B008B" stroke="#4B0082" stroke-width="1.5"/>
  <circle cx="32" cy="30" r="5" fill="#9370DB" stroke="#4B0082" stroke-width="1.5"/>
  <circle cx="26" cy="24" r="4.5" fill="#9370DB" stroke="#4B0082" stroke-width="1.5"/>
  <circle cx="38" cy="24" r="4.5" fill="#9370DB" stroke="#4B0082" stroke-width="1.5"/>
</svg>`;

// Grapefruit
const grapefruitSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="34" r="16" fill="#FF6347" stroke="#FF4500" stroke-width="2"/>
  <rect x="30" y="16" width="4" height="6" fill="#228B22" rx="1"/>
  <ellipse cx="32" cy="16" rx="4" ry="2" fill="#7CB342"/>
  <circle cx="32" cy="34" r="2.5" fill="#FFE4B5" opacity="0.8"/>
</svg>`;

// Guava
const guavaSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="34" r="14" fill="#98FB98" stroke="#6B8E23" stroke-width="2"/>
  <path d="M 32 20 Q 36 16 40 18" stroke="#556B2F" stroke-width="2" fill="none"/>
  <ellipse cx="38" cy="18" rx="6" ry="3" fill="#7CB342" stroke="#558B2F" stroke-width="1.5"/>
  <circle cx="32" cy="34" r="8" fill="#FFB6C1" opacity="0.6"/>
</svg>`;

// Kale
const kaleSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M 32 46 Q 26 40 24 32 Q 24 24 28 18 Q 30 20 30 24 Q 30 28 32 32 Z" fill="#2E7D32" stroke="#1B5E20" stroke-width="2"/>
  <path d="M 32 46 Q 38 40 40 32 Q 40 24 36 18 Q 34 20 34 24 Q 34 28 32 32 Z" fill="#388E3C" stroke="#1B5E20" stroke-width="2"/>
  <path d="M 20 36 Q 22 30 26 28 Q 28 30 28 34" fill="#4CAF50" stroke="#1B5E20" stroke-width="1.5"/>
  <path d="M 44 36 Q 42 30 38 28 Q 36 30 36 34" fill="#4CAF50" stroke="#1B5E20" stroke-width="1.5"/>
</svg>`;

// Lemon
const lemonSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="32" cy="34" rx="12" ry="15" fill="#FFFF00" stroke="#FFD700" stroke-width="2"/>
  <path d="M 32 19 Q 30 16 28 15" stroke="#228B22" stroke-width="2" fill="none"/>
  <ellipse cx="28" cy="15" rx="5" ry="2.5" fill="#7CB342" stroke="#558B2F" stroke-width="1.5"/>
  <ellipse cx="32" cy="34" rx="6" ry="8" fill="#FFFACD" opacity="0.5"/>
</svg>`;

// Lime
const limeSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="34" r="14" fill="#32CD32" stroke="#228B22" stroke-width="2"/>
  <path d="M 32 20 Q 34 16 38 16" stroke="#228B22" stroke-width="2" fill="none"/>
  <ellipse cx="38" cy="16" rx="5" ry="2.5" fill="#7CB342" stroke="#558B2F" stroke-width="1.5"/>
  <circle cx="32" cy="34" r="2" fill="#90EE90" opacity="0.8"/>
</svg>`;

// Loquat
const loquatSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="32" cy="36" rx="12" ry="14" fill="#FFA500" stroke="#D2691E" stroke-width="2"/>
  <path d="M 32 22 Q 28 18 26 14" stroke="#228B22" stroke-width="2" fill="none"/>
  <ellipse cx="38" cy="12" rx="8" ry="4" fill="#7CB342" stroke="#558B2F" stroke-width="1.5"/>
  <ellipse cx="26" cy="14" rx="6" ry="3" fill="#7CB342" stroke="#558B2F" stroke-width="1.5"/>
</svg>`;

// Olive
const oliveSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="32" cy="34" rx="8" ry="12" fill="#6B8E23" stroke="#556B2F" stroke-width="2"/>
  <path d="M 32 22 L 30 18 L 28 16" stroke="#8B7355" stroke-width="2" fill="none"/>
  <ellipse cx="26" cy="16" rx="6" ry="2.5" fill="#7CB342" stroke="#558B2F" stroke-width="1.5"/>
  <ellipse cx="32" cy="34" rx="3" ry="5" fill="#8FBC8F" opacity="0.5"/>
</svg>`;

// Orange
const orangeSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="34" r="16" fill="#FFA500" stroke="#FF8C00" stroke-width="2"/>
  <rect x="30" y="16" width="4" height="6" fill="#228B22" rx="1"/>
  <ellipse cx="32" cy="16" rx="4" ry="2" fill="#7CB342"/>
  <circle cx="32" cy="34" r="2.5" fill="#FFE4B5" opacity="0.8"/>
</svg>`;

// Peach
const peachSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="30" cy="34" r="14" fill="#FFDAB9" stroke="#FF8C69" stroke-width="2"/>
  <circle cx="36" cy="32" r="11" fill="#FFB6A3" stroke="#FF8C69" stroke-width="2"/>
  <path d="M 32 18 Q 28 14 24 14 Q 22 14 22 16 Q 22 18 24 18 Q 26 18 28 16" fill="#7CB342" stroke="#558B2F" stroke-width="1.5"/>
</svg>`;

// Pineapple Sage
const pineappleSageSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <line x1="32" y1="48" x2="32" y2="18" stroke="#6B8E23" stroke-width="2"/>
  <ellipse cx="28" cy="24" rx="8" ry="5" fill="#9ACD32" stroke="#6B8E23" stroke-width="1.5"/>
  <ellipse cx="36" cy="28" rx="7" ry="4.5" fill="#9ACD32" stroke="#6B8E23" stroke-width="1.5"/>
  <ellipse cx="28" cy="34" rx="8" ry="5" fill="#9ACD32" stroke="#6B8E23" stroke-width="1.5"/>
  <ellipse cx="36" cy="38" rx="7" ry="4.5" fill="#9ACD32" stroke="#6B8E23" stroke-width="1.5"/>
  <circle cx="40" cy="22" r="3" fill="#FF6B6B" stroke="#DC143C" stroke-width="1.5"/>
  <circle cx="24" cy="30" r="2.5" fill="#FF6B6B" stroke="#DC143C" stroke-width="1.5"/>
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

// Rose
const roseSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="30" r="10" fill="#FFB6C1" stroke="#C71585" stroke-width="2"/>
  <circle cx="32" cy="30" r="6" fill="#FF69B4" stroke="#C71585" stroke-width="1.5"/>
  <circle cx="32" cy="30" r="3" fill="#DC143C"/>
  <line x1="32" y1="40" x2="32" y2="52" stroke="#228B22" stroke-width="2"/>
  <ellipse cx="24" cy="48" rx="5" ry="3" fill="#7CB342" stroke="#558B2F" stroke-width="1.5"/>
  <ellipse cx="40" cy="50" rx="5" ry="3" fill="#7CB342" stroke="#558B2F" stroke-width="1.5"/>
</svg>`;

// Rosemary
const rosemarySvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <line x1="26" y1="48" x2="26" y2="16" stroke="#556B2F" stroke-width="2"/>
  <line x1="32" y1="48" x2="32" y2="16" stroke="#556B2F" stroke-width="2"/>
  <line x1="38" y1="48" x2="38" y2="16" stroke="#556B2F" stroke-width="2"/>
  <line x1="26" y1="20" x2="22" y2="18" stroke="#6B8E23" stroke-width="1.5"/>
  <line x1="26" y1="20" x2="30" y2="18" stroke="#6B8E23" stroke-width="1.5"/>
  <line x1="26" y1="32" x2="22" y2="30" stroke="#6B8E23" stroke-width="1.5"/>
  <line x1="26" y1="32" x2="30" y2="30" stroke="#6B8E23" stroke-width="1.5"/>
  <line x1="32" y1="26" x2="28" y2="24" stroke="#6B8E23" stroke-width="1.5"/>
  <line x1="32" y1="26" x2="36" y2="24" stroke="#6B8E23" stroke-width="1.5"/>
  <line x1="32" y1="38" x2="28" y2="36" stroke="#6B8E23" stroke-width="1.5"/>
  <line x1="32" y1="38" x2="36" y2="36" stroke="#6B8E23" stroke-width="1.5"/>
  <line x1="38" y1="20" x2="34" y2="18" stroke="#6B8E23" stroke-width="1.5"/>
  <line x1="38" y1="20" x2="42" y2="18" stroke="#6B8E23" stroke-width="1.5"/>
  <line x1="38" y1="32" x2="34" y2="30" stroke="#6B8E23" stroke-width="1.5"/>
  <line x1="38" y1="32" x2="42" y2="30" stroke="#6B8E23" stroke-width="1.5"/>
</svg>`;

// Sage
const sageSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <line x1="32" y1="48" x2="32" y2="16" stroke="#6B8E23" stroke-width="2"/>
  <ellipse cx="28" cy="22" rx="8" ry="5" fill="#9ACD32" stroke="#6B8E23" stroke-width="1.5"/>
  <ellipse cx="36" cy="26" rx="7" ry="4.5" fill="#9ACD32" stroke="#6B8E23" stroke-width="1.5"/>
  <ellipse cx="28" cy="32" rx="8" ry="5" fill="#9ACD32" stroke="#6B8E23" stroke-width="1.5"/>
  <ellipse cx="36" cy="36" rx="7" ry="4.5" fill="#9ACD32" stroke="#6B8E23" stroke-width="1.5"/>
  <ellipse cx="28" cy="42" rx="7" ry="4" fill="#9ACD32" stroke="#6B8E23" stroke-width="1.5"/>
</svg>`;

// Shiso
const shisoSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M 32 46 L 28 40 Q 22 36 20 28 Q 20 22 24 18 L 32 20 Z" fill="#8B4789" stroke="#4B0082" stroke-width="2"/>
  <path d="M 32 46 L 36 40 Q 42 36 44 28 Q 44 22 40 18 L 32 20 Z" fill="#9370DB" stroke="#4B0082" stroke-width="2"/>
  <line x1="32" y1="20" x2="28" y2="24" stroke="#DDA0DD" stroke-width="1" opacity="0.6"/>
  <line x1="32" y1="26" x2="26" y2="30" stroke="#DDA0DD" stroke-width="1" opacity="0.6"/>
  <line x1="32" y1="20" x2="36" y2="24" stroke="#DDA0DD" stroke-width="1" opacity="0.6"/>
  <line x1="32" y1="26" x2="38" y2="30" stroke="#DDA0DD" stroke-width="1" opacity="0.6"/>
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

// Strawberry Hedgehog (cactus)
const strawberryHedgehogSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="35" r="16" fill="#8FBC8F" stroke="#2F4F2F" stroke-width="2"/>
  <line x1="32" y1="19" x2="32" y2="13" stroke="#2F4F2F" stroke-width="2"/>
  <line x1="32" y1="51" x2="32" y2="57" stroke="#2F4F2F" stroke-width="2"/>
  <line x1="16" y1="35" x2="10" y2="35" stroke="#2F4F2F" stroke-width="2"/>
  <line x1="48" y1="35" x2="54" y2="35" stroke="#2F4F2F" stroke-width="2"/>
  <line x1="21" y1="24" x2="16" y2="19" stroke="#2F4F2F" stroke-width="2"/>
  <line x1="43" y1="24" x2="48" y2="19" stroke="#2F4F2F" stroke-width="2"/>
  <line x1="21" y1="46" x2="16" y2="51" stroke="#2F4F2F" stroke-width="2"/>
  <line x1="43" y1="46" x2="48" y2="51" stroke="#2F4F2F" stroke-width="2"/>
  <circle cx="32" cy="32" r="3" fill="#FF69B4"/>
  <circle cx="26" cy="38" r="2" fill="#FF69B4"/>
  <circle cx="38" cy="38" r="2" fill="#FF69B4"/>
</svg>`;

// Sweet Lime
const sweetLimeSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="34" r="14" fill="#ADFF2F" stroke="#9ACD32" stroke-width="2"/>
  <path d="M 32 20 Q 34 16 38 16" stroke="#228B22" stroke-width="2" fill="none"/>
  <ellipse cx="38" cy="16" rx="5" ry="2.5" fill="#7CB342" stroke="#558B2F" stroke-width="1.5"/>
  <circle cx="32" cy="34" r="2" fill="#F0FFF0" opacity="0.9"/>
</svg>`;

// Thyme
const thymeSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <line x1="26" y1="48" x2="26" y2="16" stroke="#6B8E23" stroke-width="2"/>
  <line x1="32" y1="48" x2="32" y2="16" stroke="#6B8E23" stroke-width="2"/>
  <line x1="38" y1="48" x2="38" y2="16" stroke="#6B8E23" stroke-width="2"/>
  <ellipse cx="24" cy="20" rx="3" ry="2" fill="#8FBC8F" stroke="#556B2F" stroke-width="1"/>
  <ellipse cx="28" cy="22" rx="3" ry="2" fill="#8FBC8F" stroke="#556B2F" stroke-width="1"/>
  <ellipse cx="24" cy="30" rx="3" ry="2" fill="#8FBC8F" stroke="#556B2F" stroke-width="1"/>
  <ellipse cx="28" cy="34" rx="3" ry="2" fill="#8FBC8F" stroke="#556B2F" stroke-width="1"/>
  <ellipse cx="30" cy="24" rx="3" ry="2" fill="#8FBC8F" stroke="#556B2F" stroke-width="1"/>
  <ellipse cx="34" cy="26" rx="3" ry="2" fill="#8FBC8F" stroke="#556B2F" stroke-width="1"/>
  <ellipse cx="30" cy="36" rx="3" ry="2" fill="#8FBC8F" stroke="#556B2F" stroke-width="1"/>
  <ellipse cx="34" cy="38" rx="3" ry="2" fill="#8FBC8F" stroke="#556B2F" stroke-width="1"/>
  <ellipse cx="36" cy="22" rx="3" ry="2" fill="#8FBC8F" stroke="#556B2F" stroke-width="1"/>
  <ellipse cx="40" cy="24" rx="3" ry="2" fill="#8FBC8F" stroke="#556B2F" stroke-width="1"/>
  <ellipse cx="36" cy="32" rx="3" ry="2" fill="#8FBC8F" stroke="#556B2F" stroke-width="1"/>
  <ellipse cx="40" cy="36" rx="3" ry="2" fill="#8FBC8F" stroke="#556B2F" stroke-width="1"/>
</svg>`;

// Aloe Vera
const aloeVeraSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M 32 48 L 30 40 Q 28 24 32 16 Q 36 24 34 40 L 32 48 Z" fill="#7CB342" stroke="#558B2F" stroke-width="2"/>
  <path d="M 28 46 L 26 38 Q 22 28 20 22 Q 24 26 28 34 L 28 46 Z" fill="#8FBC8F" stroke="#558B2F" stroke-width="2"/>
  <path d="M 36 46 L 38 34 Q 40 26 44 22 Q 42 28 38 38 L 36 46 Z" fill="#8FBC8F" stroke="#558B2F" stroke-width="2"/>
  <line x1="30" y1="22" x2="28" y2="20" stroke="#558B2F" stroke-width="1"/>
  <line x1="34" y1="22" x2="36" y2="20" stroke="#558B2F" stroke-width="1"/>
  <line x1="30" y1="30" x2="28" y2="28" stroke="#558B2F" stroke-width="1"/>
  <line x1="34" y1="30" x2="36" y2="28" stroke="#558B2F" stroke-width="1"/>
</svg>`;

// Apple
const appleSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="36" r="15" fill="#DC143C" stroke="#8B0000" stroke-width="2"/>
  <path d="M 28 22 Q 28 20 30 19" fill="none" stroke="#8B0000" stroke-width="1.5"/>
  <rect x="30" y="16" width="2.5" height="6" fill="#8B4513" rx="1"/>
  <path d="M 32 16 Q 36 14 40 16 Q 42 18 40 20 Q 38 20 36 18" fill="#7CB342" stroke="#558B2F" stroke-width="1.5"/>
  <ellipse cx="26" cy="32" rx="4" ry="6" fill="#FF6B6B" opacity="0.4"/>
</svg>`;

// Blackberry
const blackberrySvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="32" cy="36" rx="10" ry="13" fill="#2F4F4F" stroke="#191970" stroke-width="2"/>
  <circle cx="28" cy="30" r="3" fill="#4B0082" stroke="#191970" stroke-width="1"/>
  <circle cx="36" cy="30" r="3" fill="#4B0082" stroke="#191970" stroke-width="1"/>
  <circle cx="32" cy="34" r="3" fill="#4B0082" stroke="#191970" stroke-width="1"/>
  <circle cx="28" cy="38" r="3" fill="#4B0082" stroke="#191970" stroke-width="1"/>
  <circle cx="36" cy="38" r="3" fill="#4B0082" stroke="#191970" stroke-width="1"/>
  <circle cx="32" cy="42" r="3" fill="#4B0082" stroke="#191970" stroke-width="1"/>
  <path d="M 32 23 Q 34 20 36 18" stroke="#228B22" stroke-width="2" fill="none"/>
  <ellipse cx="36" cy="18" rx="5" ry="2.5" fill="#7CB342" stroke="#558B2F" stroke-width="1.5"/>
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

// Prickly Pear
const pricklyPearSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="32" cy="36" rx="10" ry="14" fill="#9ACD32" stroke="#6B8E23" stroke-width="2"/>
  <line x1="26" y1="26" x2="24" y2="22" stroke="#8B4513" stroke-width="1.5"/>
  <line x1="32" y1="24" x2="32" y2="20" stroke="#8B4513" stroke-width="1.5"/>
  <line x1="38" y1="26" x2="40" y2="22" stroke="#8B4513" stroke-width="1.5"/>
  <line x1="24" y1="36" x2="20" y2="36" stroke="#8B4513" stroke-width="1.5"/>
  <line x1="40" y1="36" x2="44" y2="36" stroke="#8B4513" stroke-width="1.5"/>
  <line x1="26" y1="46" x2="24" y2="50" stroke="#8B4513" stroke-width="1.5"/>
  <line x1="38" y1="46" x2="40" y2="50" stroke="#8B4513" stroke-width="1.5"/>
  <circle cx="28" cy="32" r="1.5" fill="#FFD700"/>
  <circle cx="36" cy="34" r="1.5" fill="#FFD700"/>
  <circle cx="32" cy="40" r="1.5" fill="#FFD700"/>
</svg>`;

// Sapote
const sapoteSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="36" r="14" fill="#8B4513" stroke="#654321" stroke-width="2"/>
  <path d="M 32 22 Q 34 18 38 18" stroke="#228B22" stroke-width="2" fill="none"/>
  <ellipse cx="38" cy="18" rx="6" ry="3" fill="#7CB342" stroke="#558B2F" stroke-width="1.5"/>
  <ellipse cx="32" cy="36" rx="8" ry="10" fill="#CD853F" opacity="0.6"/>
  <circle cx="32" cy="38" r="4" fill="#4B3621"/>
</svg>`;

// Tomato
const tomatoSvg = `<svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="36" r="14" fill="#FF6347" stroke="#DC143C" stroke-width="2"/>
  <path d="M 26 22 L 28 20 L 30 22 L 32 20 L 34 22 L 36 20 L 38 22" stroke="#228B22" stroke-width="2" fill="none"/>
  <circle cx="26" cy="22" r="2.5" fill="#7CB342" stroke="#558B2F" stroke-width="1"/>
  <circle cx="30" cy="22" r="2.5" fill="#7CB342" stroke="#558B2F" stroke-width="1"/>
  <circle cx="34" cy="22" r="2.5" fill="#7CB342" stroke="#558B2F" stroke-width="1"/>
  <circle cx="38" cy="22" r="2.5" fill="#7CB342" stroke="#558B2F" stroke-width="1"/>
  <ellipse cx="26" cy="32" rx="3" ry="5" fill="#FF7F7F" opacity="0.4"/>
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

// Raw SVGs mapped by name for wrapping
const rawSvgs: Record<string, string> = {
  aloeVera: aloeVeraSvg,
  apple: appleSvg,
  avocado: avocadoSvg,
  bamboo: bambooSvg,
  banana: bananaSvg,
  bitterOrange: bitterOrangeSvg,
  blackberry: blackberrySvg,
  blackWalnut: blackWalnutSvg,
  bluePassionflower: bluePassionflowerSvg,
  chayote: chayoteSvg,
  clementine: clementineSvg,
  collardGreens: collardGreensSvg,
  commonFig: commonFigSvg,
  commonGuava: commonGuavaSvg,
  dragonfruit: dragonfruitSvg,
  fig: figSvg,
  grape: grapeSvg,
  grapefruit: grapefruitSvg,
  guava: guavaSvg,
  japanesePersimmon: japanesePersimmonSvg,
  kale: kaleSvg,
  lavender: lavenderSvg,
  lemon: lemonSvg,
  lime: limeSvg,
  loquat: loquatSvg,
  olive: oliveSvg,
  orange: orangeSvg,
  papaya: papayaSvg,
  passionfruit: passionfruitSvg,
  peach: peachSvg,
  pineappleSage: pineappleSageSvg,
  pomegranate: pomegranateSvg,
  pricklyPear: pricklyPearSvg,
  rose: roseSvg,
  rosemary: rosemarySvg,
  sage: sageSvg,
  sapote: sapoteSvg,
  shiso: shisoSvg,
  squash: squashSvg,
  strawberryHedgehog: strawberryHedgehogSvg,
  sweetLime: sweetLimeSvg,
  thyme: thymeSvg,
  tomato: tomatoSvg,
  yellowPassionfruit: yellowPassionfruitSvg,
};

// Generate wrapped icons (white circle background)
const generateWrappedIcons = (inSeason: boolean): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const [name, svg] of Object.entries(rawSvgs)) {
    const content = extractSvgContent(svg);
    result[name] = svgToDataUri(wrapInCircle(content, inSeason));
  }
  return result;
};

// Export all fruit icons as data URIs (regular - gray border)
export const fruitIcons = generateWrappedIcons(false) as Record<string, string>;

// Export all fruit icons with green "in season" border
export const fruitIconsInSeason = generateWrappedIcons(true) as Record<string, string>;

// Icon names for type checking
export type FruitIconName = keyof typeof rawSvgs;

// Type ID to icon name mapping (primary type IDs for common fruits)
// Multiple type IDs can map to the same icon
export const typeIdToIcon: Record<number, FruitIconName> = {
  // Aloe Vera
  709: 'aloeVera', // Aloe vera
  772: 'aloeVera', // Aloe genus
  // Apple (Malus)
  14: 'apple', // Malus pumila (Apple)
  114: 'apple', // Malus genus
  270: 'apple', // Malus floribunda
  331: 'apple', // Malus sylvestris (European crabapple)
  351: 'apple', // Malus baccata (Siberian crabapple)
  402: 'apple', // Malus coronaria (Sweet crabapple)
  403: 'apple', // Malus fusca (Oregon crabapple)
  416: 'apple', // Malus hupehensis (Chinese crabapple)
  1566: 'apple', // Malus pumila 'McIntosh'
  1874: 'apple', // Malus pumila 'Cox's Orange Pippin'
  2006: 'apple', // Malus sieversii (Wild apple)
  2156: 'apple', // Malus prunifolia (Chinese apple)
  2194: 'apple', // Malus (Crabapple)
  3177: 'apple', // Malus pumila 'Honeycrisp'
  // Avocado (Persea americana)
  7: 'avocado', // Persea americana
  3363: 'avocado', // Persea americana 'Ettinger'
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
  75: 'banana', // Musa
  160: 'banana', // Musa (Plantain)
  1982: 'banana', // Musa acuminata
  2985: 'banana', // Musa acuminata (Red banana)
  5719: 'banana', // Musa acuminata x balbisiana 'Goldfinger'
  7655: 'banana', // Musa hirta (Bornean hairy banana)
  7871: 'banana', // Musa acuminata (Cavendish)
  8361: 'banana', // Musa basjoo (hardy banana)
  // Bitter orange
  81: 'bitterOrange',
  // Blackberry (Rubus)
  48: 'blackberry', // Rubus (Blackberry)
  1741: 'blackberry', // Rubus ursinus (California blackberry)
  1886: 'blackberry', // Rubus laciniatus (Evergreen blackberry)
  1986: 'blackberry', // Rubus ulmifolius (Thornless blackberry)
  2711: 'blackberry', // Rubus armeniacus (Himalayan blackberry)
  // Black walnut
  111: 'blackWalnut',
  3724: 'blackWalnut',
  // Blue passionflower
  2785: 'bluePassionflower',
  // Chayote
  518: 'chayote', // Sechium edule
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
  1496: 'dragonfruit', // Hylocereus
  // Fig
  445: 'fig',
  // Grape (including Vitis vinifera and Vitis labrusca)
  16: 'grape',
  629: 'grape', // Vitis vinifera (Common grape)
  753: 'grape', // Vitis labrusca 'Concord' (Concord grape)
  7515: 'grape', // Vitis vinifera 'Isabella'
  7677: 'grape', // Vitis labrusca 'Niagara' (Niagara grape)
  8548: 'grape', // Vitis vinifera 'Madeleine Angevine'
  8549: 'grape',
  8668: 'grape',
  8669: 'grape',
  8934: 'grape', // Vitis vinifera 'Flame Seedless'
  8935: 'grape', // Vitis vinifera 'Mars'
  // Grapefruit
  5: 'grapefruit',
  6176: 'grapefruit',
  // Guava
  76: 'guava',
  // Japanese Persimmon (Diospyros)
  12: 'japanesePersimmon', // Diospyros (Persimmon)
  246: 'japanesePersimmon', // Diospyros virginiana (American persimmon)
  280: 'japanesePersimmon', // Diospyros kaki (Japanese persimmon)
  462: 'japanesePersimmon', // Diospyros digyna (Chocolate persimmon)
  941: 'japanesePersimmon', // Diospyros texana (Texas persimmon)
  2120: 'japanesePersimmon', // Diospyros blancoi (Mabolo)
  // Kale
  50: 'kale',
  // Lavender
  17: 'lavender', // Lavandula
  918: 'lavender', // Lavandula angustifolia (English lavender)
  1623: 'lavender', // Lavandula stoechas (French lavender)
  // Lemon
  4: 'lemon',
  459: 'lemon', // Aloysia citrodora (Lemon verbena)
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
  3: 'orange', // Citrus x sinensis
  5071: 'orange',
  5725: 'orange', // Citrus x sinensis 'Cara Cara'
  5733: 'orange', // Citrus x sinensis 'Washington Navel'
  6177: 'orange', // Citrus x sinensis (Navel orange)
  7594: 'orange',
  // Papaya
  222: 'papaya', // Carica papaya
  // Passionfruit
  78: 'passionfruit', // Passiflora edulis
  1553: 'passionfruit', // Passiflora (Banana passionfruit)
  8877: 'passionfruit', // Passiflora genus
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
  4132: 'pomegranate', // Ornamental pomegranate
  4384: 'pomegranate',
  4629: 'pomegranate',
  4635: 'pomegranate',
  7930: 'pomegranate', // Dwarf pomegranate
  9952: 'pomegranate', // Flowering pomegranate
  // Prickly Pear (Opuntia)
  56: 'pricklyPear', // Opuntia (Prickly pear)
  1956: 'pricklyPear', // Opuntia ficus-indica
  // Rose
  82: 'rose',
  // Rosemary
  10: 'rosemary',
  // Sage
  9: 'sage',
  // Sapote
  95: 'sapote', // Casimiroa edulis (White sapote)
  708: 'sapote', // Manilkara zapota (Sapodilla)
  775: 'sapote', // Sapote
  2773: 'sapote', // Quararibea cordata (South American sapote)
  // Shiso
  5568: 'shiso',
  // Squash
  65: 'squash',
  // Strawberry Hedgehog Cactus (Echinocereus engelmannii)
  1333: 'strawberryHedgehog',
  // Sweet lime
  771: 'sweetLime',
  // Thyme
  192: 'thyme',
  // Tomato
  61: 'tomato', // Solanum lycopersicum
};

// Get icon name for a location based on its type IDs
export function getIconForTypes(typeIds: number[]): FruitIconName | null {
  for (const typeId of typeIds) {
    const iconName = typeIdToIcon[typeId];
    if (iconName) {
      return iconName as FruitIconName;
    }
  }
  return null;
}

