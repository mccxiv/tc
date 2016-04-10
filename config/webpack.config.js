const path = require('path');

module.exports = {
  target: 'electron',
  entry: {
    'index': path.join(__dirname, '../src/index.js')
  },
  output: {
    path: path.join(__dirname, '../_build/index.js'),
    publicPath: '/',
    filename: '[name].js'
  },
  module: {
    loaders: [
      {test: /\.js$/, loader: 'babel', exclude: /node_modules/},
      {test: /\.css$/, loader: 'style!css'},
      {test: /\.woff$/, loader: 'url'},
      {test: /\.json$/, loader: 'json'}
    ]
  },
  babel: {
    presets: ['es2015', 'stage-0'],
    plugins: ['transform-runtime']
  }
};