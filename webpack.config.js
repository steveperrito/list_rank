var Webpack = require('webpack');

module.exports = {
  entry: './js/rank.js',
  devtool: 'source-map',
  output: {
    filename: './dist/rank.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }]
  },
  plugins: [
    new Webpack.ProvidePlugin({
      $: "jquery/dist/jquery.slim",
      jQuery: "jquery/dist/jquery.slim",
    })
  ]
};
