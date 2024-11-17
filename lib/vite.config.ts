import {resolve} from 'path';
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import sassDts from 'vite-plugin-sass-dts'
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [
        vue(),
        sassDts(),
        vueJsx(),
        tsconfigPaths()
    ],
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
        lib: {
            entry: resolve(__dirname, 'src/main.ts'),
            name: 'CbrDraggable',
            fileName: 'CbrDraggable'
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
