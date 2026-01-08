module.exports = {
  content: ['./src/**/*.{astro,html,js,ts,jsx,tsx}'],
  safelist: [
    // Component classes we generate in @layer components so they are never purged accidentally
  'btn','btn-primary','btn-outline','btn-muted','card','badge','badge-creative','badge-technical','badge-writing','tag','stack-tag','meta','heading-gradient','heading-display','nav-link','nav-link-active'
  ],
  theme: {
    extend: {
      fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    display: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['Roboto Mono', 'ui-monospace', 'SFMono-Regular', 'monospace']
      },
      colors: {
        brand: {
          DEFAULT: '#111827',
          fg: '#ffffff'
        },
        surface: {
          light: '#ffffff',
          dark: '#111827'
        },
        creative: {
          DEFAULT: '#2563eb',
          light: '#eff6ff'
        },
        technical: {
          DEFAULT: '#059669',
          light: '#ecfdf5'
        },
        writing: {
          DEFAULT: '#7e22ce',
          light: '#faf5ff'
        },
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.08)',
        'card-hover': '0 8px 24px -4px rgb(0 0 0 / 0.10)',
      },
      borderRadius: {
        xl: '0.75rem',
        pill: '9999px'
      },
      transitionTimingFunction: {
        'snappy': 'cubic-bezier(.4,0,.2,1)'
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
};