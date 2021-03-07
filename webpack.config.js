const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = {
  mode:'development',
  entry: './src/app.ts',
  module: {
    rules: [
      {
        test: /\.scss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader', 'sass-loader'
        ],
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.ts(x)?$/,
        exclude: /node_modules/,
        use: [
          'babel-loader'
        ]
      }
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    historyApiFallback: true,
    index: 'index.html',
    contentBase: path.join(__dirname, 'public'),
    compress: true,
    hot:true,
    port: 3000
  },  
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/theme.css'
    }),
    new ESLintPlugin({
      fix: false,
      extensions: ['.js', '.jsx', '.vue', '.ts', '.tsx'],
      cache: false,
      emitWarning: true,
      emitError: true
    })
  ]
};