const path = require('path');
const base = {
  node: {
    __filename: false,
    __dirname: false
  },

  output: {
    path: path.join(__dirname, '../_build'),
    filename: '[name]'
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

const main = Object.assign({}, base, {
  target: 'electron-main',
  entry: {
    'main.js': path.join(__dirname, '../src/main.js')
  }
});

const renderer = Object.assign({}, base, {
  target: 'electron-renderer',
  entry: {
    'renderer.js': path.join(__dirname, '../src/ng/app.js')
  }
});

module.exports = [main, renderer];