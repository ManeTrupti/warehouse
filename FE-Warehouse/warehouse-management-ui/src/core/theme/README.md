# Theme System

A centralized theme system for the application that integrates with tenant-specific themes while providing common theme utilities.

## Overview

The theme system consists of:
- **Theme Configuration** (`themeConfig.js`) - Centralized theme values (colors, spacing, typography, etc.)
- **ThemeProvider** (`ThemeProvider.jsx`) - React context provider that makes theme available throughout the app
- **useTheme Hook** - Hook to access theme values in components

## Usage

### Basic Setup

The `ThemeProvider` is already integrated in `App.jsx` and wraps the entire application. It automatically integrates with the tenant system to apply tenant-specific theme overrides.

### Using the Theme in Components

```jsx
import { useTheme } from '@core/theme';

function MyComponent() {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  
  return (
    <div
      style={{
        backgroundColor: colors.background.primary,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        boxShadow: shadows.md,
        color: colors.text.primary,
      }}
    >
      <h1 style={{ 
        fontSize: typography.fontSize.xl[0],
        color: colors.primary.DEFAULT,
        marginBottom: spacing.md,
      }}>
        My Component
      </h1>
    </div>
  );
}
```

### Theme Structure

The theme object provides:

- **colors**: Color palette including primary, secondary, accent, semantic colors (success, warning, error, info), and neutral colors
- **spacing**: Consistent spacing scale (xs, sm, md, lg, xl, 2xl, 3xl, 4xl)
- **typography**: Font families, sizes, and weights
- **borderRadius**: Border radius values
- **shadows**: Box shadow definitions
- **breakpoints**: Responsive breakpoints
- **transitions**: Transition durations and easing functions
- **zIndex**: Z-index scale for layering

### Helper Functions

The theme context provides a `getColor` helper function:

```jsx
const { getColor } = useTheme();
const primaryColor = getColor('primary.DEFAULT');
const errorColor = getColor('error.500');
```

### Integration with Tenant Themes

The theme system automatically merges tenant-specific theme overrides:
- Tenant `primary` color overrides `colors.primary.DEFAULT`
- Tenant `secondary` color overrides `colors.secondary.DEFAULT`
- Tenant `accent` color overrides `colors.accent.DEFAULT`

These are also applied as CSS variables (`--theme-primary`, `--theme-secondary`, `--theme-accent`) for use with Tailwind CSS.

### Using with Tailwind CSS

You can use the theme colors with Tailwind classes:

```jsx
<div className="bg-primary text-white p-4">
  This uses the theme primary color
</div>
```

The Tailwind config is set up to use the theme CSS variables, so `text-primary`, `bg-primary`, etc. will use the tenant-specific colors when available.

## Examples

### Button Component with Theme

```jsx
import { useTheme } from '@core/theme';

function Button({ children, variant = 'primary' }) {
  const { colors, spacing, borderRadius, shadows, transitions } = useTheme();
  
  const variantStyles = {
    primary: {
      backgroundColor: colors.primary.DEFAULT,
      color: colors.text.inverse,
    },
    secondary: {
      backgroundColor: colors.secondary.DEFAULT,
      color: colors.text.inverse,
    },
    outline: {
      border: `2px solid ${colors.primary.DEFAULT}`,
      color: colors.primary.DEFAULT,
      backgroundColor: 'transparent',
    },
  };
  
  return (
    <button
      style={{
        ...variantStyles[variant],
        padding: `${spacing.sm} ${spacing.md}`,
        borderRadius: borderRadius.md,
        boxShadow: shadows.sm,
        transition: `all ${transitions.duration.normal} ${transitions.easing.easeInOut}`,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}
```

### Card Component with Theme

```jsx
import { useTheme } from '@core/theme';

function Card({ children, title }) {
  const { colors, spacing, borderRadius, shadows } = useTheme();
  
  return (
    <div
      style={{
        backgroundColor: colors.background.primary,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        boxShadow: shadows.md,
        border: `1px solid ${colors.gray[200]}`,
      }}
    >
      {title && (
        <h3 style={{ 
          color: colors.text.primary,
          marginBottom: spacing.md,
          fontSize: '1.125rem',
          fontWeight: 600,
        }}>
          {title}
        </h3>
      )}
      <div style={{ color: colors.text.secondary }}>
        {children}
      </div>
    </div>
  );
}
```

