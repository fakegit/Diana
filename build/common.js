const path = require('path');
const autoprefixer = require('autoprefixer');
const postcssImport = require('postcss-import');
const CleanPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpack = require('webpack');

const PATHS = {
  app: path.join(__dirname, '../src/js/containers/'),
  build: path.join(__dirname, '../static/dist/'),
  nodeModules: path.join(__dirname, '../node_modules/'),
};

const VENDOR = [
  'jquery',
  'highlight.js',
];

module.exports = {
  entry: {
    vendor: VENDOR,
    editor: [PATHS.app + 'editor'],
    article: [PATHS.app + 'article'],
    index: [PATHS.app + 'index'],
    tag: [PATHS.app + 'tag'],
    tags: [PATHS.app + 'tags'],
    login: [PATHS.app + 'login'],
    error: [PATHS.app + 'error'],
  },

  output: {
    filename: '[name].[chunkhash].js',
    path: PATHS.build,
    publicPath: '/static/dist/'  // 在将 JS 文件插入到 HTML 中时会用到这个路径
  },

  plugins: [
    new CleanPlugin(['dist'], {
      root: path.join(__dirname, '../static/'),
      verbose: true,
      dry: false
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../src/templates/editor.html'),
      hash: true,
      filename: 'editor.html',
      chunks: ['vendor', 'editor', 'commons'],
      inject: 'body'
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../src/templates/article.html'),
      hash: true,
      filename: 'article.html',
      chunks: ['vendor', 'article', 'commons'],
      inject: 'body'
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../src/templates/index.html'),
      hash: true,
      filename: 'index.html',
      chunks: ['vendor', 'index', 'commons'],
      inject: 'body'
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../src/templates/tag.html'),
      hash: true,
      filename: 'tag.html',
      chunks: ['vendor', 'tag', 'commons'],
      inject: 'body'
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../src/templates/tags.html'),
      hash: true,
      filename: 'tags.html',
      chunks: ['vendor', 'tags', 'commons'],
      inject: 'body'
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../src/templates/login.html'),
      hash: true,
      filename: 'login.html',
      chunks: ['vendor', 'login', 'commons'],
      inject: 'body'
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../src/templates/error.html'),
      hash: true,
      filename: 'error.html',
      chunks: ['vendor', 'error', 'commons'],
      inject: 'body'
    }),

    // 只是把模板文件移到 dist 目录
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../src/templates/article_list.html'),
      filename: 'article_list.html',
      inject: false
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../src/templates/footer.html'),
      filename: 'footer.html',
      inject: false
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../src/templates/right.html'),
      filename: 'right.html',
      inject: false
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../src/templates/scrollreveal.html'),
      filename: 'scrollreveal.html',
      inject: false
    }),

    new webpack.optimize.CommonsChunkPlugin({name: 'vendor', filename: 'vendor.[hash].js'}),
    // new webpack.optimize.CommonsChunkPlugin({name: 'commons', filename: 'commons.[chunkhash].js'}),

    new ExtractTextPlugin('[name].[contenthash].css'),

    // new webpack.ProvidePlugin({
    //   $: "jquery",
    //   jQuery: "jquery"
    // })
  ],

  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx', '.json', '.css'],
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['es2015', 'stage-1'],
            }
          }
        ]
      },
      {
        test: /\.html$/,
        loader: 'raw-loader'
      },
      {
        test: /\.(css|sass|scss)$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                plugins: function () {
                  return [
                    require('autoprefixer')
                  ];
                }
              }
            },
            {
              loader: 'sass-loader',
              options: {
                includePaths: [PATHS.nodeModules]
              }
            }
          ]
        })
      },
      {
        test: /\.(jpe?g|png|gif|bmp|ico)$/i,
        loader: 'file-loader?name=img/[name].[ext]',
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=10000&minetype=application/font-woff',
      },
      {
        test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=10000&minetype=application/octet-stream',
      },
      {
        test: /\.svg(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader?limit=10000&minetype=application/font-woff',
      },
      {
        test: /\.json(\?.*)?$/,
        loader: 'file-loader?name=/files/[name].[ext]'
      }
    ]
  },
};
