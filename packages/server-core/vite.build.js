import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import path from 'path';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import { defineConfig } from 'vite';
import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';

const isProd = process.env.NODE_ENV === 'production';
const extensions = ['.js', '.ts', '.json'];

export default defineConfig(() => {
  return {
    build: {
      lib: {
        entry: path.resolve(__dirname, 'src/index.ts'),
        name: 'server-core'
      },
      minify: 'esbuild',
      sourcemap: 'inline',
      rollupOptions: {
        input: path.resolve(__dirname, 'src/index.ts'),
        output: { dir: 'lib', format: 'es', sourcemap: true, inlineDynamicImports: true },
        plugins: [
          alias({
            entries: [
              { find: 'buffer', replacement: 'buffer/'},
            ]
          }),
          nodePolyfills(),
          commonjs(),
          json(),
          typescript({
            tsconfig: path.resolve(__dirname, 'tsconfig.json'),
            sourceMap: false
          }),
          replace({
            'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
            preventAssignment: false
          }),
          resolve({
            extensions,
          })
        ],
      }
    }
  }
});
