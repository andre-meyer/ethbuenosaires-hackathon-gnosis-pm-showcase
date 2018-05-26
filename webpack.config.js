const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

module.exports = {
  context: path.join(__dirname, 'src'),
  entry: 'index.js',
  devtool: 'eval-source-map',
  output: {
    path: `${__dirname}/dist`,
  },
  mode: 'development',
  resolve: {
    symlinks: false,
    modules: [
      `${__dirname}/src`,
      'node_modules',
    ],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules)/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              modules: true,
              localIdentName: '[name]__[local]___[hash:base64:5]',
              importLoaders: 2,
            },
          },
        ]
      }
    ],
  },
  devServer: {
    disableHostCheck: true,
    historyApiFallback: true,
    hot: true,
    port: 5000,
    watchOptions: {
      ignored: /node_modules/,
    },
    contentBase: [path.join(__dirname, 'dist'), path.join(__dirname, 'src')],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src/html/index.html'),
    }),
  ]
}
