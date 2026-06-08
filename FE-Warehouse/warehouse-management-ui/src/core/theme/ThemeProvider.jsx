import { createContext, useContext, useMemo, useEffect } from 'react';
import { defaultTheme } from './themeConfig';

const ThemeContext = createContext(null);

/**
 * ThemeProvider - Provides theme context throughout the application
 */
export function ThemeProvider({ children }) {
    // Use default theme
    const theme = useMemo(() => defaultTheme, []);

    // Apply CSS variables for dashboard theme
    useEffect(() => {
        const root = document.documentElement;

        // Dashboard-specific color variants (from theme config)
        root.style.setProperty('--theme-primary', theme.colors.primary.DEFAULT);
        root.style.setProperty('--theme-primary-dark', theme.colors.primary.dark);
        root.style.setProperty('--theme-primary-light', theme.colors.primary.light);
        root.style.setProperty('--theme-secondary', theme.colors.secondary.DEFAULT);
        root.style.setProperty('--theme-secondary-light', theme.colors.secondary.light);
        root.style.setProperty('--theme-accent', theme.colors.accent.DEFAULT);
        root.style.setProperty('--theme-accent-light', theme.colors.accent.light);
        root.style.setProperty('--theme-success', theme.colors.success.DEFAULT);
        root.style.setProperty('--theme-error', theme.colors.error.DEFAULT);
        root.style.setProperty('--theme-error-light', theme.colors.error.light);

        // Background colors
        root.style.setProperty('--theme-bg-page', theme.colors.background.page);
        root.style.setProperty('--theme-bg-card', theme.colors.background.card);
        root.style.setProperty('--theme-bg-header', theme.colors.background.dark);

        // Sidebar colors
        root.style.setProperty('--theme-sidebar-bg', theme.dashboard.sidebar.backgroundColor);
        root.style.setProperty('--theme-sidebar-active-bg', theme.dashboard.sidebar.activeBackground);
        root.style.setProperty('--theme-sidebar-active-border', theme.dashboard.sidebar.activeBorder);
        root.style.setProperty('--theme-sidebar-text', theme.dashboard.sidebar.textColor);

        return () => {
            root.style.removeProperty('--theme-primary');
            root.style.removeProperty('--theme-primary-dark');
            root.style.removeProperty('--theme-primary-light');
            root.style.removeProperty('--theme-secondary');
            root.style.removeProperty('--theme-secondary-light');
            root.style.removeProperty('--theme-accent');
            root.style.removeProperty('--theme-accent-light');
            root.style.removeProperty('--theme-success');
            root.style.removeProperty('--theme-error');
            root.style.removeProperty('--theme-error-light');
            root.style.removeProperty('--theme-bg-page');
            root.style.removeProperty('--theme-bg-card');
            root.style.removeProperty('--theme-bg-header');
            root.style.removeProperty('--theme-sidebar-bg');
            root.style.removeProperty('--theme-sidebar-active-bg');
            root.style.removeProperty('--theme-sidebar-active-border');
            root.style.removeProperty('--theme-sidebar-text');
        };
    }, [theme]);

    const value = useMemo(
        () => ({
            theme,
            colors: theme.colors,
            spacing: theme.spacing,
            typography: theme.typography,
            borderRadius: theme.borderRadius,
            shadows: theme.shadows,
            breakpoints: theme.breakpoints,
            transitions: theme.transitions,
            zIndex: theme.zIndex,
            dashboard: theme.dashboard, // Dashboard-specific theme values
            // Helper functions
            getColor: (colorPath) => {
                const parts = colorPath.split('.');
                let value = theme.colors;
                for (const part of parts) {
                    value = value?.[part];
                    if (value === undefined) return null;
                }
                return value;
            },
        }),
        [theme]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to access theme context
 * @returns {Object} Theme context value
 */
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

