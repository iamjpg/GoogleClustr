// import { buildSync } from 'esbuild';
// import { sassPlugin } from 'esbuild-sass-plugin';
const esbuild = require('esbuild');
const scss = require('esbuild-sass-plugin');

const results = esbuild.build({
  entryPoints: ['src/index.ts'],
  outdir: 'dist',
  bundle: true,
  sourcemap: true,
  minify: true,
  splitting: true,
  format: 'esm',
  target: ['esnext'],
  plugins: [scss.sassPlugin()],
});

// console.log(results);
