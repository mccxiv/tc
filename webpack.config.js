const path = require('path')

const base = {
  devtool: 'cheap-module-inline-source-map',
  node: {
    __filename: false,
    __dirname: false
  },
  performance: {
    hints: false
  },
  output: {
    path: path.join(__dirname, '_build'),
    filename: '[name]'
  },
  stats: 'minimal',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['es2015', 'stage-0'],
              plugins: ['transform-runtime', 'angularjs-annotate']
            }
          }
        ],
        include: [
          path.resolve(__dirname, 'src', 'tc-main'),
          path.resolve(__dirname, 'src', 'tc-renderer'),
          path.resolve(__dirname, 'src', 'node_modules', 'twitch-js')
        ]
      },
      {
        test: /frosty\.min\.js$/,
        use: [
          {
            loader: 'imports-loader',
            options: {jQuery: 'jquery'}
          }
        ]
      },
      {
        test: /\.(ttf|woff|woff2)/,
        use: [
          {loader: 'url-loader'}
        ]
      },
      {
        test: /\.(png|ogg)$/,
        use: [
          {loader: 'url-loader'}]
      },
      {
        test: /\.node$/,
        use: [
          {loader: 'node-loader'}
        ]
      },
      {
        test: /\.html$/,
        use: [
          {loader: 'html-loader'}
        ]
      },
      {
        test: /\.pug$/,
        use: [
          {loader: 'html-loader'},
          {loader: 'pug-html-loader'}
        ]
      },
      {
        test: /\.css$/,
        use: [
          {loader: 'style-loader'},
          {loader: 'css-loader'}
        ]
      },
      {
        test: /\.styl$/,
        use: [
          {loader: 'style-loader'},
          {loader: 'css-loader'},
          {loader: 'stylus-loader'}
        ]
      }
    ]
  },
  externals: /bufferutil|utf-8-validate/ // Ignore missing optional modules
}

const main = Object.assign({}, base, {
  target: 'electron-main',
  entry: {
    'main.js': path.join(__dirname, 'src/tc-main/main.js')
  }
})

const renderer = Object.assign({}, base, {
  target: 'electron-renderer',
  entry: {
    'renderer.js': path.join(__dirname, 'src/tc-renderer/renderer.js')
  }
})

module.exports = [main, renderer]
