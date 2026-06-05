import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // KB Hair Design System
        'kb-black':     '#0A0A0A',
        'kb-white':     '#FFFFFF',
        'kb-off-white': '#FAFAF8',
        'kb-cream':     '#F5F3EF',
        'kb-gold':      '#C9A84C',
        'kb-gold-light':'#E8D5A3',
        'kb-gold-dark': '#9B7B2E',
        'kb-gray-100':  '#F2F2F2',
        'kb-gray-200':  '#E5E5E5',
        'kb-gray-300':  '#D4D4D4',
        'kb-gray-500':  '#737373',
        'kb-gray-700':  '#404040',
        'kb-gray-900':  '#171717',
      },
      fontFamily: {
        'serif':   ['var(--font-cormorant)', 'Georgia', 'serif'],
        'heading': ['var(--font-cormorant)', 'Georgia', 'serif'],
        'sans':    ['var(--font-jost)', 'system-ui', 'sans-serif'],
        'body':    ['var(--font-jost)', 'system-ui', 'sans-serif'],
        'mono':    ['var(--font-dm-mono)', 'monospace'],
      },
      fontSize: {
        'display-2xl': ['4.5rem',   { lineHeight: '1', letterSpacing: '0.08em' }],
        'display-xl':  ['3.75rem',  { lineHeight: '1', letterSpacing: '0.06em' }],
        'display-lg':  ['3rem',     { lineHeight: '1.05', letterSpacing: '0.05em' }],
        'display-md':  ['2.25rem',  { lineHeight: '1.1', letterSpacing: '0.04em' }],
        'display-sm':  ['1.875rem', { lineHeight: '1.2', letterSpacing: '0.04em' }],
        'label-lg':    ['0.875rem', { lineHeight: '1', letterSpacing: '0.15em' }],
        'label-md':    ['0.75rem',  { lineHeight: '1', letterSpacing: '0.2em' }],
        'label-sm':    ['0.625rem', { lineHeight: '1', letterSpacing: '0.25em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '38': '9.5rem',
      },
      maxWidth: {
        'site': '1440px',
        'content': '1280px',
        'narrow': '900px',
      },
      transitionTimingFunction: {
        'kb': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'kb-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'kb-in': 'cubic-bezier(0.4, 0, 1, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'gold-shimmer': {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      animation: {
        'fade-up':        'fade-up 0.6s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
        'fade-in':        'fade-in 0.4s ease forwards',
        'slide-in-right': 'slide-in-right 0.4s cubic-bezier(0.25, 0.1, 0.25, 1) forwards',
        'gold-shimmer':   'gold-shimmer 3s linear infinite',
      },
      boxShadow: {
        'kb-sm':  '0 1px 3px 0 rgba(0,0,0,0.08)',
        'kb':     '0 4px 16px 0 rgba(0,0,0,0.08)',
        'kb-lg':  '0 16px 40px 0 rgba(0,0,0,0.12)',
        'kb-gold':'0 4px 20px 0 rgba(201,168,76,0.25)',
      },
      aspectRatio: {
        'product':  '3/4',
        'hero':     '16/9',
        'square':   '1/1',
        'portrait': '2/3',
      },
    },
  },
  plugins: [],
}

export default config
