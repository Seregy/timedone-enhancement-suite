const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

const SOURCE_DIRECTORY_NAME = 'src';
const STATIC_CONTENT_DIRECTORY_NAME = 'static';
const BUILD_DIRECTORY_NAME = 'dist';

module.exports = {
  devtool: "cheap-source-map",
  entry: {
    content: `./${SOURCE_DIRECTORY_NAME}/content-scripts/content-script.js`,
    action: `./${SOURCE_DIRECTORY_NAME}/browser-action/script.js`,
    options: `./${SOURCE_DIRECTORY_NAME}/options/script.js`
  },
  output: {
    path: path.resolve(__dirname, BUILD_DIRECTORY_NAME),
    filename: "[name]/index.js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: {
          presets: [
            [
              '@babel/preset-env',
              {
                targets: {
                  firefox: "78.0"
                }
              }
            ],
          ],
        },
      }
    ],
  },
  resolve: {
    extensions: [".js"]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: `${STATIC_CONTENT_DIRECTORY_NAME}`, to: "."}
      ],
    }),
  ],
};