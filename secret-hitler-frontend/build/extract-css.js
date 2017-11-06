var utils = require('./utils')
var ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports.default = new ExtractTextPlugin({
    filename: utils.assetsPath('css/[name].[contenthash].css')
})

module.exports.components = new ExtractTextPlugin({
    filename: utils.assetsPath('css/[name].components.[contenthash].css')
})