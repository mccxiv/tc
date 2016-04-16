const path = require('path');
const webpack = require('webpack');

const base = {
  devtool: false,
  node: {
    __filename: false,
    __dirname: false
  },
  output: {
    path: path.join(__dirname, '_build'),
    filename: '[name]'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        include: [
          path.resolve(__dirname, 'src', 'tc-main'),
          path.resolve(__dirname, 'src', 'tc-renderer'),
          path.resolve(__dirname, 'src', 'node_modules', 'tmi.js')
        ]
      },
      {test: /\.css$/, loader: 'style!css'},
      {test: /\.(ttf|woff|woff2)/, loader: 'url'}, // Missing $ is intentional
      {test: /\.(png|ogg)$/, loader: 'url'},
      {test: /\.json$/, loader: 'json'},
      {test: /\.node$/, loader: 'node'},
      {test: /\.html$/, loader: 'html'}
    ]
  },
  babel: {
    presets: ['es2015', 'stage-0'],
    plugins: ['transform-runtime']
  }
};

const main = Object.assign({}, base, {
  target: 'electron-main',
  entry: {
    'main.js': path.join(__dirname, 'src/tc-main/main.js')
  }
});

const renderer = Object.assign({}, base, {
  target: 'electron-renderer',
  entry: {
    'renderer.js': path.join(__dirname, 'src/tc-renderer/app.js')
  }
});

module.exports = [main, renderer];