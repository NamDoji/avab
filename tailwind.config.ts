import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── AvaB Design System — Dark Cherry Master Brand ──
        cherry: {
          50:      '#FFF7F9',
          100:     '#FDECF0',
          200:     '#F9CCD6',
          300:     '#EF9AAF',
          400:     '#DC607D',
          500:     '#BE3659',
          600:     '#951F3D',
          700:     '#7B1933',
          800:     '#5F1227',
          900:     '#400B19',
          950:     '#29050F',
          DEFAULT: '#951F3D',
        },
        // Learning Joy
        'avab-sky':      '#4385F5',
        'avab-mint':     '#27A875',
        'avab-sunshine': '#F4BD3C',
        'avab-orange':   '#F27A49',
        'avab-violet':   '#8064D8',
        'avab-aqua':     '#28A9A5',
        'avab-coral':    '#E85F65',
        // Semantic
        'avab-success':  '#18825B',
        'avab-warning':  '#B86A00',
        'avab-error':    '#C53A49',
        'avab-info':     '#3475CB',
        'avab-ai':       '#7458C6',
        // Màu theo môn học
        subject: {
          math:      '#4385F5',
          viet:      '#D95B75',
          english:   '#8064D8',
          coding:    '#28A9A5',
          science:   '#27A875',
          physics:   '#3974C6',
          chemistry: '#16A0A5',
          biology:   '#63A744',
          history:   '#B77A3B',
          geography: '#32A18C',
          art:       '#E665A4',
          skills:    '#F27A49',
        },
        // primary map sang Cherry (update từ tím cũ)
        primary: {
          DEFAULT:    '#951F3D',
          foreground: '#ffffff',
          50:  '#FFF7F9',
          100: '#FDECF0',
          200: '#F9CCD6',
          300: '#EF9AAF',
          400: '#DC607D',
          500: '#BE3659',
          600: '#951F3D',
          700: '#7B1933',
          800: '#5F1227',
          900: '#400B19',
        },
        // Legacy — giữ để không break code cũ
        avab: {
          purple:        '#7C3AED',
          'purple-light':'#A78BFA',
          'purple-dark': '#5B21B6',
          teal:          '#14B8A6',
          'teal-light':  '#5EEAD4',
          'teal-dark':   '#0F766E',
          red:           '#EF4444',
          'red-light':   '#FCA5A5',
          orange:        '#F97316',
          yellow:        '#FBBF24',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-nunito)', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'float': 'float 3s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
