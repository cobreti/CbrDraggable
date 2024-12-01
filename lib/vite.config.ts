import {resolve} from 'path';
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import sassDts from 'vite-plugin-sass-dts'
import tsconfigPaths from 'vite-tsconfig-paths';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [
        vue(),
        sassDts(),
        vueJsx(),
        tsconfigPaths(),
        dts()
    ],
    resolve: {
        alias: {
          "@/": new URL("./src/", import.meta.url).pathname,
        },
      },
    optimizeDeps: {
        esbuildOptions: {
            tsconfigRaw: {
                compilerOptions: {
                    experimentalDecorators: true
                }
            }
        }
    },
    build: {
        target: "esnext",
        emptyOutDir: true,
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'CbrDraggable',
            fileName: (format) => `index.${format}.js`,
        },
        rollupOptions: {
            external: ['vue'],
            output: {
                globals: {
                    vue: 'Vue'
                }
            }
        }
    }
});
