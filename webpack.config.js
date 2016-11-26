
const webpack = require('webpack');
const {resolve} = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extensionPath = resolve(__dirname, 'keysearch.safariextension');
const isProduction = process.env.NODE_ENV === 'production'

var jsLoaders = [{
  loader: 'babel-loader',
  options: {
    presets: [['es2015', {modules: false}], 'stage-0', 'react'],
    plugins: ['transform-runtime']
  }
}]

if (isProduction) {
  jsLoaders.push({
    loader: 'strip-loader',
    options: {
      strip: ['console.log']
    }
  })
}

module.exports = {
  entry: {
    global: './src/global.js',
    injected: './src/injected.js',
    index: './src/index.jsx'
  },
  output: {
    path: extensionPath,
    filename: '[name].js'
  },
  plugins: [
    new webpack.NoErrorsPlugin(),
    new ExtractTextPlugin('[name].css')
  ],
  resolve: {
    extensions: ['.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract({
          fallbackLoader: ['style-loader'],
          loader: ['css-loader', 'sass-loader']
        })
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: jsLoaders
      },
      {
        test: /\.(jpg|png|svg|ttf|eot|woff2?)$/,
        loader: 'file-loader',
        options: {
          name: '[path][name].[ext]'
        }
      },
      {test: /\.json$/, loader: 'json-loader'}
    ]
  }
}
