import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';

module.exports = {
  input: 'src/main.ts',
  output: {
    file: 'main.js',
    format: 'cjs',
  },
  context: 'this',
  plugins: [
    json(),
    typescript(),
    nodeResolve(),
    commonjs({
      ignore: ['bufferutil', 'utf-8-validate'],
    }),
  ],
  external: [
    'url',
  ],
};
