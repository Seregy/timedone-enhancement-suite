const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

const SOURCE_DIRECTORY_NAME = 'src';
const STATIC_CONTENT_DIRECTORY_NAME = 'static';
const MANIFEST_FILE_NAME = 'manifest.json';
const BUILD_DIRECTORY_NAME = 'dist';
const MANIFEST_VERSION_VARIABLE = '${version}';

const packageFile = require('./package.json');

module.exports = {
  devtool: 'cheap-source-map',
  mode: 'production',
  entry: {
    content: `./${SOURCE_DIRECTORY_NAME}/content-scripts/content-script.js`,
    action: `./${SOURCE_DIRECTORY_NAME}/browser-action/action.js`,
  },
  output: {
    path: path.resolve(__dirname, BUILD_DIRECTORY_NAME),
    filename: '[name]/index.js',
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
                  firefox: '78.0',
                },
              },
            ],
          ],
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js'],
  },
  performance: {
    maxAssetSize: 500000,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: `${STATIC_CONTENT_DIRECTORY_NAME}`,
          to: '.',
          globOptions: {
            ignore: MANIFEST_FILE_NAME,
          },
        },
        {
          from: `${STATIC_CONTENT_DIRECTORY_NAME}/${MANIFEST_FILE_NAME}`,
          to: '.',
          transform(content) {
            return content
                .toString()
                .replace(MANIFEST_VERSION_VARIABLE, packageFile.version);
          },
        },
        {
          from: './node_modules/@material/checkbox/dist/mdc.checkbox.css',
          to: 'action',
        },
        {
          from:
            './node_modules/@material/form-field/dist/mdc.form-field.css',
          to: 'action',
        },
      ],
    }),
    new ESLintPlugin(),
  ],
};
