import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src'],
    splitting: false,
    sourcemap: false,
    dts: true,
    format: 'esm',
    clean: true,
})
