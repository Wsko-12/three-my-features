const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    index: '/client/src/index.js',
  },
  mode:'development',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, './client/dist'),
  },
  plugins: [
    new CopyPlugin({
        patterns: [
            { from: path.resolve(__dirname, './client/src/assets'), to: path.resolve(__dirname, './client/dist/assets') },
        ],
    }),
    new HtmlWebpackPlugin({
      template:path.resolve(__dirname, './client/src/index.html'),
      chunks: ['index'],
      scriptLoading: 'module',
      // minify:{
      //   collapseWhitespace: true,
      //   keepClosingSlash: true,
      //   removeComments: true,
      //   removeRedundantAttributes: true,
      //   removeScriptTypeAttributes: true,
      //   removeStyleLinkTypeAttributes: true,
      //   useShortDoctype: true
      // }
    }),
  ],
  module:{
    rules:[
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
    ]
  },
  experiments: { outputModule: true },
};