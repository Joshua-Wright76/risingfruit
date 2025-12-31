/**
 * Rising Fruit Color System
 * 
 * All UI colors consolidated in one place for easy customization.
 * These values are also defined in index.css as CSS custom properties for Tailwind.
 */

export const colors = {
  // ============================================================
  // PRIMARY - Nature Green
  // Used for: in-season indicators, verified markers, success states
  // ============================================================
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#149c464b',  // Main brand green
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // ============================================================
  // ACCENT - Fruit Orange
  // Used for: unverified markers, highlights, call-to-action
  // ============================================================
  accent: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',  // Main accent orange
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },

  // ============================================================
  // SURFACE - Background & Container Colors (Dark Theme)
  // Used for: backgrounds, cards, panels, overlays
  // ============================================================
  surface: {
    950: '#0a0a0a',  // Darkest - app background
    900: '#171717',  // Card backgrounds, panels
    800: '#262626',  // Elevated surfaces, inputs
    700: '#404040',  // Borders, dividers
    600: '#525252',  // Subtle borders
    500: '#737373',  // Muted text
    400: '#a3a3a3',  // Secondary text
    300: '#d4d4d4',  // Primary text (dark mode)
    200: '#e5e5e5',  // Light backgrounds
    100: '#f5f5f5',  // Lighter backgrounds
    50: '#fafafa',   // Lightest - text on dark
  },

  // ============================================================
  // SEMANTIC - Status & Feedback Colors
  // ============================================================
  semantic: {
    error: '#f87171',     // Error messages, failed states
    warning: '#fbbf24',   // Warnings, caution states
    success: '#22c55e',   // Same as primary-500
    info: '#60a5fa',      // Informational messages
  },

  // ============================================================
  // MARKER - Map Marker Specific Colors
  // ============================================================
  marker: {
    // Cluster colors by density (dark mode: grey, light mode: could be white)
    cluster: {
      low: '#404040',      // surface-700 - lighter grey
      medium: '#525252',   // surface-600
      high: '#737373',     // surface-500 - darker grey
      stroke: '#171717',   // surface-900
      text: '#ffffff',     // white text on clusters
    },
    // Individual marker colors
    verified: '#22c55e',   // primary-500
    unverified: '#f97316', // accent-500
    // Marker stroke/outline
    stroke: '#171717',     // surface-900
    textOnMarker: '#ffffff',
  },

  // ============================================================
  // FRUIT ICON - Icon Circle Background & Border
  // ============================================================
  fruitIcon: {
    // Circle background - adapts to theme
    backgroundDark: '#262626',   // surface-800 - dark mode
    backgroundLight: '#ffffff',  // white - light mode (future)
    // Border colors
    borderInSeason: '#22c55e',   // primary-500 - green when in season
    borderDefault: '#6b7280',    // gray-500 - gray when not in season
    // Border widths
    borderWidthInSeason: 5,
    borderWidthDefault: 3,
  },
} as const;

// Type exports for TypeScript
export type ColorScale = typeof colors.primary;
export type SurfaceScale = typeof colors.surface;
export type Colors = typeof colors;

// Export individual scales for convenience
export const { primary, accent, surface, semantic, marker, fruitIcon } = colors;

