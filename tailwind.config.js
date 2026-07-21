/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Orbit Clay design tokens (CSS-variable driven for dual themes)
        deep: 'var(--bg-deep)',
        deep2: 'var(--bg-deep-2)',
        clay: {
          DEFAULT: 'var(--clay-surface)',
          hi: 'var(--clay-surface-hi)',
          inset: 'var(--clay-inset)',
        },
        sun: 'var(--accent-sun)',
        ice: 'var(--accent-ice)',
        coral: 'var(--accent-coral)',
        mint: 'var(--accent-mint)',
        ink: {
          DEFAULT: 'var(--text-primary)',
          soft: 'var(--text-secondary)',
          mute: 'var(--text-muted)',
        },
        planet: {
          mercury: '#B8A99A',
          venus: '#E8C07D',
          earth: '#6FB7FF',
          mars: '#E07A5F',
          jupiter: '#D9A066',
          saturn: '#E3CE9E',
          uranus: '#9FE3E0',
          neptune: '#6E8CFF',
        },
        // shadcn tokens
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        display: ['"Baloo 2"', '"Noto Sans SC"', 'sans-serif'],
        body: ['Nunito', '"Noto Sans SC"', 'sans-serif'],
        mono: ['"DM Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
        'clay-sm': 'var(--r-sm)',
        'clay-md': 'var(--r-md)',
        'clay-lg': 'var(--r-lg)',
        'clay-xl': 'var(--r-xl)',
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        clay: 'var(--clay-shadow)',
        'clay-hover': 'var(--clay-shadow-hover)',
        'clay-inset': 'var(--clay-inset-shadow)',
      },
      maxWidth: {
        content: '1320px',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        clayfloat: {
          '0%,100%': { transform: 'translateY(-8px)' },
          '50%': { transform: 'translateY(8px)' },
        },
        breathe: {
          '0%,100%': { opacity: '0.45' },
          '50%': { opacity: '1' },
        },
        twinkle: {
          '0%,100%': { opacity: '0.25' },
          '50%': { opacity: '0.9' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        'clay-float': 'clayfloat 5s ease-in-out infinite',
        breathe: 'breathe 3.2s ease-in-out infinite',
        twinkle: 'twinkle 4s ease-in-out infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
