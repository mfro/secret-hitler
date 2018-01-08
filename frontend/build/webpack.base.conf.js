var path = require('path')
var utils = require('./utils')
var config = require('../config')
var merge = require('webpack-merge')
var vueLoaderConfig = require('./vue-loader.conf')

function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

function makeConfig(c) {
  return merge({
    output: {
      path: config.build.assetsRoot,
      publicPath: process.env.NODE_ENV === 'production'
        ? config.build.assetsPublicPath
        : config.dev.assetsPublicPath
    },
    resolve: {
      extensions: ['.js', '.vue', '.json'],
      alias: {
        '@': resolve('src.common'),
        '@player': resolve('src.player'),
        '@spectate': resolve('src.spectate'),
        'style': resolve('src.common/uikit/style/imports.less'),
      }
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: vueLoaderConfig
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          include: [resolve('src.common'), resolve('src.player'), resolve('src.spectate'), resolve('test')],
        },
        {
          test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: utils.assetsPath('img/[name].[hash:7].[ext]')
          }
        },
        {
          test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: utils.assetsPath('media/[name].[hash:7].[ext]')
          }
        },
        {
          test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
          }
        }
      ]
    }
  }, c)
}

var playerConfig = makeConfig({
  name: 'player',
  entry: {
    'player-app': './src.player/main.js',
  },
  output: {
    filename: 'player-app.js',
  },
})

var spectateConfig = makeConfig({
  name: 'spectate',
  entry: {
    'spectate-app': './src.spectate/main.js',
  },
  output: {
    filename: 'spectate-app.js',
  },
})

module.exports = [playerConfig, spectateConfig]