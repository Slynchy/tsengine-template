const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: [
    './index.ts'
  ],
  mode: process.env.NODE_ENV || 'development',
  devtool: "source-map",
  target: "web",
  devServer: {
    contentBase: path.join(__dirname, 'dist'), // boolean | string | array, static file location
    compress: true, // enable gzip compression
  },
  plugins: [
    new CopyPlugin([
      { from: 'src/assets', to: './assets' }
    ]),
    new HtmlWebpackPlugin({
      template: "src/config/index.html"
    })
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.ts$/,
        enforce: 'pre',
        use: [
          {
            loader: 'tslint-loader',
            options: {
              // can specify a custom config file relative to current directory or with absolute path
              // 'tslint-custom.json'
              configFile: 'tslint.json',

              // tslint errors are displayed by default as warnings
              // set emitErrors to true to display them as errors
              emitErrors: true,

              // tslint does not interrupt the compilation by default
              // if you want any file with tslint errors to fail
              // set failOnHint to true
              failOnHint: true,

              // enables type checked rules like 'for-in-array'
              // uses tsconfig.json from current working directory
              typeCheck: false,

              // automatically fix linting errors
              fix: false,

              // can specify a custom tsconfig file relative to current directory or with absolute path
              // to be used with type checked rules
              tsConfigFile: 'tsconfig.json'
            }
          }
        ]
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'assets/fonts/'
            }
          }
        ]
      }
    ],
  },
  resolve: {
    modules: [
      path.resolve('./node_modules'),
      path.resolve('./lib')
    ],
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
