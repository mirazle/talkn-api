const webpack = require('webpack');
const path = require('path');
const os = require('os');
const homeDir = os.homedir();

module.exports = {
  cache: false,
  entry: {
    javascript: path.resolve(__dirname, `./src`),
  },
  output: {
    filename: `talkn.api.js`,
    path: path.resolve(__dirname, `./dist/`),
  },
  module: {
    rules: [
      {
        test: /\.tsx|.ts$/,
        exclude: [/node_modules/],
        use: [{ loader: 'ts-loader' }],
      },
    ],
  },
  resolve: {
    alias: {
      '@api': path.resolve(homeDir, 'talkn-api/src') + '/',
      '@common': path.resolve(homeDir, 'talkn-common/src') + '/',
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    fallback: {
      process: require.resolve('process/browser'),
      os: require.resolve('os-browserify/browser'),
    },
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
  devServer: {
    allowedHosts: 'all',
    compress: true,
    server: {
      type: 'https',
      options: {
        key: path.resolve(homeDir, `talkn-common/certs/localhost.key`),
        cert: path.resolve(homeDir, `talkn-common/certs/localhost.crt`),
      },
    },
    port: 8000,
  },

  //  plugins: [new BundleAnalyzerPlugin()],
  devtool: 'inline-source-map',
};
