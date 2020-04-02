import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

const babelOptions = {
  exclude: 'node_modules/**',
  presets: [['@babel/preset-env', { modules: false }]],
  babelrc: false
};

export default [
  {
    input: 'dist/esm2015/index.js',
    output: [
      {
        format: 'commonjs',
        dir: 'dist',
        plugins: [
          babel(babelOptions),
        ]
      },
      {
        format: 'umd',
        file: 'dist/bundle/i18nextICU.js',
        name: 'i18nextICU',
        plugins: [
          babel(babelOptions),
        ]
      },
      {
        format: 'umd',
        file: 'dist/bundle/i18nextICU.min.js',
        name: 'i18nextICU',
        plugins: [
          babel(babelOptions),
          terser()
        ]
      }
    ],
    plugins: [
      nodeResolve({ jsnext: true })
    ]
  },
  {
    input: 'dist/esm2015/node-polyfill.js',
    output: [
      {
        format: 'commonjs',
        dir: 'dist',
      }
    ],
    plugins: [
      babel(babelOptions),
      nodeResolve({ jsnext: true })
    ]
  }
]
