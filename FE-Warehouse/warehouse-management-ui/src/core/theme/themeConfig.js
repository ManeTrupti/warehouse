/**
 * Common theme configuration for the application
 * This provides a centralized theme system that works with tenant-specific themes
 */

export const defaultTheme = {
    colors: {
        // Primary colors - Blue (matching IPSS brand, Demand Fulfillment, Engine Orders)
        primary: {
            50: '#e6f0ff',
            100: '#b3d1ff',
            200: '#80b3ff',
            300: '#4d94ff',
            400: '#1a75ff',
            500: '#0056e6',
            600: '#0044b3',
            700: '#003380',
            800: '#00214d',
            900: '#00101a',
            DEFAULT: '#2563eb', // Main brand blue
            dark: '#1e3a8a', // Dark blue for header
            light: '#3b82f6', // Light blue for cards
        },
        // Secondary colors - Orange (matching Axle Orders, donut charts)
        secondary: {
            50: '#fff4e6',
            100: '#ffd9b3',
            200: '#ffbf80',
            300: '#ffa44d',
            400: '#ff8a1a',
            500: '#e67000',
            600: '#b35900',
            700: '#804200',
            800: '#4d2800',
            900: '#1a0d00',
            DEFAULT: '#f97316', // Orange accent
            light: '#fb923c', // Light orange for card backgrounds
        },
        // Accent colors - Light blue (matching In Progress cards)
        accent: {
            50: '#e6f5ff',
            100: '#b3e0ff',
            200: '#80ccff',
            300: '#4db8ff',
            400: '#1aa3ff',
            500: '#008fe6',
            600: '#0072b3',
            700: '#005580',
            800: '#00384d',
            900: '#001b1a',
            DEFAULT: '#0ea5e9', // Light blue accent
            light: '#38bdf8', // Very light blue for backgrounds
        },
        // Semantic colors
        success: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
            DEFAULT: '#22c55e', // Green for positive trends
            light: '#86efac', // Light green for backgrounds
        },
        warning: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
            DEFAULT: '#f59e0b',
        },
        error: {
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            300: '#fca5a5',
            400: '#f87171',
            500: '#ef4444',
            600: '#dc2626',
            700: '#b91c1c',
            800: '#991b1b',
            900: '#7f1d1d',
            DEFAULT: '#ef4444', // Red for warnings
            light: '#fee2e2', // Light red for Active Shortages card background
        },
        info: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
            DEFAULT: '#3b82f6',
        },
        // Neutral colors
        gray: {
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937',
            900: '#111827',
            DEFAULT: '#6b7280',
        },
        // Background colors - matching dashboard backgrounds
        background: {
            primary: '#ffffff', // White for cards
            secondary: '#f3f4f6', // Light gray for page background
            tertiary: '#f9fafb', // Slightly lighter gray
            dark: '#1e3a8a', // Dark blue for header
            card: '#ffffff', // Card background
            page: '#f3f4f6', // Main page background
        },
        // Text colors
        text: {
            primary: '#111827',
            secondary: '#6b7280',
            tertiary: '#9ca3af',
            inverse: '#ffffff',
            disabled: '#d1d5db',
        },
    },
    spacing: {
        xs: '0.25rem',    // 4px
        sm: '0.5rem',     // 8px
        md: '1rem',       // 16px
        lg: '1.5rem',     // 24px
        xl: '2rem',       // 32px
        '2xl': '3rem',    // 48px
        '3xl': '4rem',    // 64px
        '4xl': '6rem',    // 96px
    },
    typography: {
        fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
            serif: ['Georgia', 'serif'],
            mono: ['Menlo', 'Monaco', 'monospace'],
        },
        fontSize: {
            xs: ['0.75rem', { lineHeight: '1rem' }],
            sm: ['0.875rem', { lineHeight: '1.25rem' }],
            base: ['1rem', { lineHeight: '1.5rem' }],
            lg: ['1.125rem', { lineHeight: '1.75rem' }],
            xl: ['1.25rem', { lineHeight: '1.75rem' }],
            '2xl': ['1.5rem', { lineHeight: '2rem' }],
            '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
            '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
            '5xl': ['3rem', { lineHeight: '1' }],
        },
        fontWeight: {
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
        },
    },
    borderRadius: {
        none: '0',
        sm: '0.125rem',   // 2px
        md: '0.375rem',   // 6px
        lg: '0.5rem',     // 8px - Default for cards (matching dashboard)
        xl: '0.75rem',    // 12px
        '2xl': '1rem',    // 16px
        '3xl': '1.5rem',  // 24px
        full: '9999px',
        card: '0.5rem',   // Card border radius (matching dashboard)
    },
    shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 2px 4px 0 rgb(0 0 0 / 0.06), 0 1px 2px 0 rgb(0 0 0 / 0.04)', // Subtle shadow for cards
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        none: 'none',
        card: '0 2px 4px 0 rgb(0 0 0 / 0.06), 0 1px 2px 0 rgb(0 0 0 / 0.04)', // Card shadow (matching dashboard)
    },
    breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
    },
    transitions: {
        duration: {
            fast: '150ms',
            normal: '200ms',
            slow: '300ms',
        },
        easing: {
            easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
            easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
            easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        },
    },
    zIndex: {
        dropdown: 1000,
        sticky: 1020,
        fixed: 1030,
        modalBackdrop: 1040,
        modal: 1050,
        popover: 1060,
        tooltip: 1070,
        header: 100, // Header bar z-index
    },
    // Dashboard-specific theme values
    dashboard: {
        header: {
            height: '64px', // Header height
            backgroundColor: '#1e3a8a', // Dark blue header
            textColor: '#ffffff',
        },
        card: {
            borderRadius: '0.5rem',
            padding: '1.5rem',
            backgroundColor: '#ffffff',
            shadow: '0 2px 4px 0 rgb(0 0 0 / 0.06), 0 1px 2px 0 rgb(0 0 0 / 0.04)',
        },
        kpi: {
            iconSize: '24px',
            valueSize: '2rem',
            labelSize: '0.875rem',
        },
        sidebar: {
            backgroundColor: 'rgb(237 236 236 / 77%)', // Light grey background with opacity
            activeBackground: '#ffffff', // White for active tab
            activeBorder: '#d4d4d4', // Softer border for active tab
            textColor: '#2f2f2f', // Slightly darker text for contrast
            borderRadius: '9999px', // Pill-like rounded corners
            padding: '0.5rem',
            itemPadding: '0.75rem 1.25rem',
        },
    },
};

/**
 * Merges tenant-specific theme overrides with default theme
 * @param {Object} tenantTheme - Tenant-specific theme overrides
 * @returns {Object} Merged theme configuration
 */
export const mergeTheme = (tenantTheme = {}) => {
    const merged = { ...defaultTheme };

    // Override primary, secondary, and accent colors if provided by tenant
    if (tenantTheme.primary) {
        merged.colors.primary.DEFAULT = tenantTheme.primary;
    }
    if (tenantTheme.secondary) {
        merged.colors.secondary.DEFAULT = tenantTheme.secondary;
    }
    if (tenantTheme.accent) {
        merged.colors.accent.DEFAULT = tenantTheme.accent;
    }

    return merged;
};

