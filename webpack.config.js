// webpack.config.js

const path = require('path');

module.exports = {
  entry: './src/index.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: 'MyButton',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,  
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },

      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.svg$/,
        use: ['file-loader'], // Use @svgr and url-loader
      },

      {
        test: /\.(png|jpe?g|gif|bmp|svg)$/i, // This handles images
        use: [
          {
            loader: 'url-loader', // Can use file-loader as an alternative
            options: {
              limit: 8192, // Files smaller than 8kb will be inlined as base64 data URLs
              name: 'images/[name].[hash:8].[ext]', // This outputs images to the 'images' folder in dist with a hashed name
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  externals: {
    react: 'react',  // React should not be bundled with your component
    'react-dom': 'react-dom',
  },
};
