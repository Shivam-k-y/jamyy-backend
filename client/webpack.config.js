const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
  mode: 'development', // Use 'production' for production builds
  entry: './src/index.js', // Entry point of your application
  output: {
    filename: 'bundle.js', // Output filename
    path: path.resolve(__dirname, 'dist'), // Output directory
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Apply this rule to .js files
        exclude: /node_modules/, // Exclude node_modules
        use: {
          loader: 'babel-loader', // Use Babel to transpile ES6
        },
      },
    ],
  },
  plugins: [
    new Dotenv(), // Load environment variables from .env
  ],
  devServer: {
    static: path.join(__dirname, 'dist'), // Serve files from the 'dist' directory
    compress: true, // Enable gzip compression for everything served
    port: 9000, // The port you want to run the server on
    open: true, // Open the browser after server had been started
    hot: true, // Enable Hot Module Replacement
  },
};
