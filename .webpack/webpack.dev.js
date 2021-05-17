const path = require('path')
const webpack = require('webpack')
const webpackBase = require('./webpack.base.js');
const { merge } = require('webpack-merge');
const autoprefixer = require('autoprefixer')
const vtkRules = require('vtk.js/Utilities/config/dependency.js').webpack.core
  .rules
// Plugins
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

// PATHS
const PROJECT_ROOT = path.join(__dirname, '..', 'packages/demo')
const ENTRY_EXAMPLES = path.join(PROJECT_ROOT, 'src/index.tsx')
const SRC_PATH = path.join(PROJECT_ROOT, './src')
const OUT_PATH = path.join(PROJECT_ROOT, './dist')
// CONFIG
const APP_CONFIG = process.env.APP_CONFIG || 'config/default.js'
const APP_CONFIG_PATH = path.join(PROJECT_ROOT, `./${APP_CONFIG}`)

// Need to add this if you want to yarn link locally.
// Add this additional call so we can yarn link vtk.js
// const shaderLoader = {
//   test: /\.glsl$/i,
//   loader: 'shader-loader',
// };

module.exports = (env, argv, { SRC_DIR, DIST_DIR }) => {
  const baseConfig = webpackBase(env, argv, { SRC_DIR, DIST_DIR });

  // return merge(baseConfig, {
  //   // module: {
  //   //   rules: [cssToJavaScriptRule, stylusToJavaScriptRule],
  //   // },
  // });

  return {
    entry: {
      examples: ENTRY_EXAMPLES,
    },
    devtool: 'eval-source-map',
    mode: 'development',
    output: {
      path: OUT_PATH,
      filename: '[name].bundle.[contenthash].js',
      library: 'Cornerstone3DAlpha',
      libraryTarget: 'umd',
      globalObject: 'this',
    },
    module: {
      rules: [
        {
          test: /\.(ts|tsx|js|jsx)$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: {
            // Find babel.config.js in monorepo root
            // https://babeljs.io/docs/en/options#rootmode
            rootMode: 'upward',
            envName: 'development',
          },
        },
        {
          test: /\.css$/,
          exclude: /\.module\.css$/,
          use: [
            'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: () => [autoprefixer('last 2 version', 'ie >= 11')],
                },
              },
            },
          ],
        },
      ].concat(vtkRules),
      //.concat(shaderLoader),
    },
    resolve: {
      modules: [path.resolve(__dirname, './../node_modules')],
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      fallback: {
        fs: false,
        path: require.resolve('path-browserify'),
      },
    },
        plugins: [
      // Show build progress
      new webpack.ProgressPlugin(),
      // Clear dist between builds
      new CleanWebpackPlugin(),
      // Generate `index.html` with injected build assets
      new HtmlWebpackPlugin({
        filename: 'index.html',
        template: path.resolve(__dirname, './../packages/demo', 'public', 'index.html'),
      }),
    ],
    devServer: {
      hot: true,
      open: true,
      port: 3000,
      historyApiFallback: true,
    },
  }
};
