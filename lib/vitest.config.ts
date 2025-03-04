import {fileURLToPath} from 'node:url'
import {mergeConfig, defineConfig, configDefaults} from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
    viteConfig,
    defineConfig({
        test: {
            environment: 'jsdom',
            environmentOptions: {
              url: 'https://localhost'
            },
            exclude: [...configDefaults.exclude, 'e2e/*'],
            root: fileURLToPath(new URL('./', import.meta.url)),
            coverage: {
              provider: 'istanbul',
              reporter: ['html', 'lcov', 'text-summary'],
            }
        }
    })
)
