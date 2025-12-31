import { createTheme } from '@mantine/core';

// Custom color tuple type for Mantine
type MantineColorsTuple = [string, string, string, string, string, string, string, string, string, string];

// Surface colors - Dark theme backgrounds (index 0 = lightest, 9 = darkest)
const surface: MantineColorsTuple = [
  '#fafafa',  // 0 - Lightest (text on dark)
  '#f5f5f5',  // 1
  '#e5e5e5',  // 2
  '#d4d4d4',  // 3 - Primary text (dark mode)
  '#a3a3a3',  // 4 - Secondary text
  '#737373',  // 5 - Muted text / tertiary
  '#525252',  // 6 - Subtle borders
  '#404040',  // 7 - Borders, dividers
  '#262626',  // 8 - Elevated surfaces, inputs
  '#171717',  // 9 - Card backgrounds, panels
];

// Primary - Nature green (used for: in-season indicators, verified markers, success states)
const primary: MantineColorsTuple = [
  '#f0fdf4',  // 0
  '#dcfce7',  // 1
  '#bbf7d0',  // 2
  '#86efac',  // 3
  '#4ade80',  // 4
  '#22c55e',  // 5 - Main brand green
  '#16a34a',  // 6
  '#15803d',  // 7
  '#166534',  // 8
  '#14532d',  // 9
];

// Accent - Fruit orange (used for: unverified markers, highlights, call-to-action)
const accent: MantineColorsTuple = [
  '#fff7ed',  // 0
  '#ffedd5',  // 1
  '#fed7aa',  // 2
  '#fdba74',  // 3
  '#fb923c',  // 4
  '#f97316',  // 5 - Main accent orange
  '#ea580c',  // 6
  '#c2410c',  // 7
  '#9a3412',  // 8
  '#7c2d12',  // 9
];

export const theme = createTheme({
  primaryColor: 'primary',
  colors: {
    surface,
    primary,
    accent,
  },
  defaultRadius: 'md',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
  
  // Component-specific defaults
  components: {
    Paper: {
      defaultProps: {
        radius: 'lg',
      },
    },
    Button: {
      defaultProps: {
        radius: 'lg',
      },
    },
  },
});

