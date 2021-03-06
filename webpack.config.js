import {resolve as _resolve, dirname as _dirname} from 'path';
import {fileURLToPath} from 'url';
import CopyPlugin from 'copy-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import {readFileSync} from 'fs';

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
  action: `./${SOURCE_DIRECTORY_NAME}/browser-action/action.js`,
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
                firefox: '78.0',
              },
            },
          ],
        ],
      },
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
          ignore: MANIFEST_FILE_NAME,
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
        from: './node_modules/@material/checkbox/dist/mdc.checkbox.css',
        to: 'action',
      },
      {
        from: './node_modules/@material/form-field/dist/mdc.form-field.css',
        to: 'action',
      },
    ],
  }),
  new ESLintPlugin(),
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
