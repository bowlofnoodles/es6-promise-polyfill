const {uglify} = require('rollup-plugin-uglify');
const {babel} = require('@rollup/plugin-babel');

const isProdEnv = process.env.NODE_ENV === 'production';

/** @type {import('rollup').RollupOptions} */
module.exports = {
  input: './src/index.js',
  output: {
    file: isProdEnv ? './lib/index.min.js' : './lib/index.js',
    format: 'umd',
    name: 'PromisePolyfill'
  },
  plugins: [
    babel({ babelHelpers: 'bundled' }),
    isProdEnv && uglify()
  ]
};
