import {resolve as _resolve, dirname as _dirname} from 'path';
import {fileURLToPath} from 'url';
import CopyPlugin from 'copy-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import {readFileSync} from 'fs';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const SOURCE_DIRECTORY_NAME = 'src';
const STATIC_CONTENT_DIRECTORY_NAME = 'static';
const MANIFEST_FILE_NAME = 'manifest.json';
const BUILD_DIRECTORY_NAME = 'dist';
const MANIFEST_VERSION_VARIABLE = '${version}';
const PACKAGE_PATH = './package.json';

const devtool = 'cheap-source-map';
const mode = 'production';
const entry = {
  content: `./${SOURCE_DIRECTORY_NAME}/content-scripts/content-script.js`,
  option: `./${SOURCE_DIRECTORY_NAME}/option/options.js`,
};
const baseDirPath = _dirname(fileURLToPath(import.meta.url));
const output = {
  path: _resolve(baseDirPath, BUILD_DIRECTORY_NAME),
  filename: '[name]/index.js',
  clean: true,
};

const module = {
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
                firefox: '109.0',
              },
            },
          ],
        ],
      },
    },
    {
      test: /\.css$/,
      use: [MiniCssExtractPlugin.loader, 'css-loader'],
    },
  ],
};

const resolve = {
  extensions: ['.js'],
};

const performance = {
  maxAssetSize: 500000,
};

const plugins = [
  new CopyPlugin({
    patterns: [
      {
        from: `${STATIC_CONTENT_DIRECTORY_NAME}`,
        to: '.',
        globOptions: {
          ignore: [MANIFEST_FILE_NAME],
        },
      },
      {
        from: `${STATIC_CONTENT_DIRECTORY_NAME}/${MANIFEST_FILE_NAME}`,
        to: '.',
        transform(content) {
          const currentVersion =
           JSON.parse(readFileSync(PACKAGE_PATH).toString()).version;
          return content.toString()
              .replace(MANIFEST_VERSION_VARIABLE, currentVersion);
        },
      },
      {
        from: 'node_modules/uikit/dist/css/uikit.min.css',
        to: 'option',
      },
      {
        from: 'node_modules/uikit/dist/css/uikit.min.css',
        to: 'content',
      },
    ],
  }),
  new ESLintPlugin(),
  new MiniCssExtractPlugin({
    filename: '[name]/[name].css',
  }),
];

export default {
  devtool,
  mode,
  entry,
  output,
  module,
  resolve,
  performance,
  plugins,
};
