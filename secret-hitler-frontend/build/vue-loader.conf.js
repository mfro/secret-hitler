var utils = require('./utils')
var config = require('../config')
var extracts = require('./extract-css')
var isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  preserveWhitespace: false,
  loaders: utils.cssLoaders({
    sourceMap: isProduction
      ? config.build.productionSourceMap
      : config.dev.cssSourceMap,
    extract: isProduction ? extracts.components : null
  }),
  transformToRequire: {
    video: 'src',
    source: 'src',
    img: 'src',
    image: 'xlink:href'
  }
}
