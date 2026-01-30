const path = require('path');

module.exports = {
  mode: "development",
  // The entry point file described above
  entry: {
    data: "./src/scripts/data/index.js",
    login: "./src/scripts/user-entry/log-in.js",
    signup: "./src/scripts/user-entry/sign-up.js",
    default: "./src/scripts/default.js",
    settings: "./src/scripts/settings.js"
  },
  // Dev server for HMR, live reload
  devServer: {
    static: {
      directory: __dirname,
    },
    port: 8080,
    open: true, // Open the browser automatically
    hot: true, // Enable HMR (default in recent versions)
  },
  // The location of the build folder described above
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js'
  },
  // Optional and for development only. This provides the ability to
  // map the built code back to the original source format when debugging.
  devtool: 'eval-source-map',
};