import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  plugins: [
    plugin(function({ addVariant }) {
      addVariant('hover-focus', ['&:hover', '&:focus'])
    }),
  ],
} satisfies Config;
