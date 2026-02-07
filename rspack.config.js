const path = require('path');

const ROOT_DIR = __dirname;
module.exports = function (env) {
  const production = env && env.production;
  let config = {
    entry: {
      simplepicker: [
        './lib/simplepicker.css',
        './lib/index.ts'
      ]
    },
    output: {
      filename: '[name].js',
      path: path.resolve(ROOT_DIR, 'dist'),
      library: 'SimplePicker',
      libraryTarget: 'var'
    },
    resolve: {
      extensions: ['.css', '.ts', '.js']
    },
    context: ROOT_DIR,
    target: 'web',
    mode: production ? 'production' : 'development',
    devtool: 'source-map',
    optimization: {
      moduleIds: 'deterministic'
    },
    experiments: {
      css: true
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          type: 'css'
        },
        {
          test: /\.ts$/,
          exclude: [/node_modules/, /tests/],
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
              },
              target: 'es5',
            },
          },
          type: 'javascript/auto',
        }
      ]
    }
  };

  if (production) {
    // build a commonjs format file for consumption with
    // build tools like webpack, rspack, and rollup.
    let nodeConfig = { output: {} };
    nodeConfig.output.libraryTarget = 'commonjs2';
    nodeConfig.entry = {
      'simplepicker.node': './lib/index.ts'
    };

    config = [config, { ...config, ...nodeConfig }];
  } else {
    config.output.publicPath = '/dist/';
  }

  return config;
};
