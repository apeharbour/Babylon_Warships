const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');


module.exports = {
  entry: {
    main: './src/index.ts',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          compilerOptions: {
            sourceMap: true,
            esModuleInterop: true,
          },
        },
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'sass-loader' },
        ],
      },
      {
        test: /\.(jpg|png|gif|env|dds|hdr|glb|gltf)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: false,
              name: 'static/resources/[name].[hash:8].[ext]',
            },
          },
        ],
      },
      {
        test: /\.fx/i,
        use: [
          {
            loader: 'raw-loader',
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: './public/index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/Resources/', to: 'Resources' },
      ],
    }),
  ],
  output: {
    filename: 'static/js/[name].[fullhash:8].js',
    chunkFilename: 'static/js/[name].[fullhash:8].chunk.js',
    path: path.resolve(__dirname, 'public'),
    publicPath: '/',

  },
  devServer: {
    static: path.join(__dirname, 'public/'),
    watchFiles: ["src/**/*"],
    devMiddleware: {
     // contentBase: path.join(__dirname, 'public'),  // serve from public folder
      publicPath: '/'   // make sure publicPath is root
    },
    port: 8080,
    hot: true,
    compress: true,
    
  }
};
