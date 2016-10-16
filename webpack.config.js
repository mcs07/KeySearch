
const webpack = require('webpack');
const {resolve} = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extensionPath = resolve(__dirname, 'keysearch.safariextension');

module.exports = {
  devtool: "eval-source-map",  // eval for production?
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
    new webpack.DefinePlugin({'process.env':{'NODE_ENV': JSON.stringify('development')}}),  // TODO: production
    new webpack.NoErrorsPlugin(),
    new ExtractTextPlugin('[name].css')
  ],
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      {test: /\.scss$/, loader: ExtractTextPlugin.extract('style', 'css?sourceMap!postcss!sass?sourceMap')},
      {
        test: /\.jsx?$/,
        loader: 'babel',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'stage-0', 'react'],
          plugins: ['transform-runtime']
        }
      },
      {
        test: /\.(jpg|png|svg|ttf|eot|woff2?)$/,
        loaders: [
            'file-loader?name=[path][name].[ext]'
        ]
      }
    ]
  }
}


// TODO: https://github.com/yahoo/strip-loader in production
