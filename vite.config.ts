import { defineConfig } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  define: {
    'import.meta.env.VITE_DEPLOY_ENVIRONMENT': JSON.stringify(process.env.CLOUDFLARE_ENV ?? 'staging'),
  },
  server: {
    port: 3000,
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart(),
    react(),
  ],
});
