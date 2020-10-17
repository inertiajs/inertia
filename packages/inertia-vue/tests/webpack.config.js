const path = require('path')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  entry: './app/app.js',
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
    ],
  },
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'tmp'),
    publicPath: '/',
  },
  plugins: [
    new VueLoaderPlugin(),
  ],
  resolve: {
    extensions: ['*', '.js', '.vue'],
    alias: {
      '@inertiajs/inertia': path.resolve(__dirname, '../../inertia/dist/index.js'),
      '@inertiajs/inertia-vue': path.resolve(__dirname, '../dist/index.js'),
    },
  },
  stats: 'errors-only',
}
