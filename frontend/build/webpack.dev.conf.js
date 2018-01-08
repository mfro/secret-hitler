var fs = require('fs')
var path = require('path')
var utils = require('./utils')
var webpack = require('webpack')
var config = require('../config')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var PreloadWebpackPlugin = require('preload-webpack-plugin')
var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

// add hot-reload related code to entry chunks
for (var i = 0; i < baseWebpackConfig.length; i++) {
  Object.keys(baseWebpackConfig[i].entry).forEach(function (name) {
    baseWebpackConfig[i].entry[name] = ['./build/dev-client'].concat(baseWebpackConfig[i].entry[name])
  })

  baseWebpackConfig[i] = merge(baseWebpackConfig[i], {
    plugins: [
      new webpack.DefinePlugin({
        'WEBPACK_NAME': JSON.stringify(baseWebpackConfig[i].name),
      })
    ]
  })
}

var baseDevConfig = {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: '#cheap-module-eval-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': config.dev.env
    }),
    // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new PreloadWebpackPlugin(),
    new FriendlyErrorsPlugin(),
  ]
};

var playerConfig = merge(baseWebpackConfig[0], baseDevConfig, {
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true,
      serviceWorkerLoader: `<script>${fs.readFileSync(path.join(__dirname,
        './service-worker-dev.js'), 'utf-8')}</script>`
    }),
  ]
})

var spectateConfig = merge(baseWebpackConfig[1], baseDevConfig, {
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'spectate/index.html',
      template: 'index.html',
      inject: true,
      serviceWorkerLoader: `<script>${fs.readFileSync(path.join(__dirname,
        './service-worker-dev.js'), 'utf-8')}</script>`
    }),
  ]
})

module.exports = [playerConfig, spectateConfig];
