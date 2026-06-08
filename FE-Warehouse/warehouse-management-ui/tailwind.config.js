/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Tenant-specific theme colors (from ThemeProvider) - Matching Production Planning Dashboard
        primary: 'var(--theme-primary, var(--tenant-primary, #2563eb))',
        'primary-dark': 'var(--theme-primary-dark, #1e3a8a)',
        'primary-light': 'var(--theme-primary-light, #3b82f6)',
        secondary: 'var(--theme-secondary, var(--tenant-secondary, #f97316))',
        'secondary-light': 'var(--theme-secondary-light, #fb923c)',
        accent: 'var(--theme-accent, var(--tenant-accent, #0ea5e9))',
        'accent-light': 'var(--theme-accent-light, #38bdf8)',
        success: 'var(--theme-success, #22c55e)',
        error: 'var(--theme-error, #ef4444)',
        'error-light': 'var(--theme-error-light, #fee2e2)',
        // Legacy support for tenant variables
        'tenant-primary': 'var(--tenant-primary, #2563eb)',
        'tenant-secondary': 'var(--tenant-secondary, #f97316)',
        'tenant-accent': 'var(--tenant-accent, #0ea5e9)',
      },
      backgroundColor: {
        page: 'var(--theme-bg-page, #f3f4f6)',
        card: 'var(--theme-bg-card, #ffffff)',
        header: 'var(--theme-bg-header, #1e3a8a)',
      },
    },
  },
  plugins: [],
};
