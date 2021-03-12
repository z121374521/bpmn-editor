const path = require('path');
// gzip压缩插件
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const webpack = require('webpack');

// vue配别名
function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  // 基本路径
  // TODO common-workflow变量化
  publicPath: '/',
  // 输出文件目录
  outputDir: 'dist',
  // 当代码不符合eslint规范时候 停止编译。
  lintOnSave: 'error',
  pages: {
    index: {
      // pages的入口文件
      entry: 'tests/main.js',
      // 模版文件
      template:'tests/index.html'
    },
  },
  // webpack loader配置
  chainWebpack: config => {
    // eslint检查loader
    config.module
      .rule('eslint')
      .use('eslint-loader')
      .loader('eslint-loader');
    // 配别名
    config.resolve.alias
      .set('package', resolve('package.json'))
      .set('assets', resolve('src/assets'))
      .set('api', resolve('src/api'))
      .set('views', resolve('src/views'))
      .set('components', resolve('src/components'));
  },
  // webpack打包配置
  configureWebpack: config => {
    const plugins = [
      // 优化打包 使用gzip
      new CompressionWebpackPlugin({
        algorithm: 'gzip',
        test: new RegExp('\\.(' + ['js', 'css'].join('|') + ')$'),
        // 文件大小超过10240b，压缩
        threshold: 10240,
      }),
      // maxChunks：使用大于或等于1的值，来限制chunk的最大数量。使用1防止添加任何其他额外的chunk，这是因为entry/main chunk也会包含在计数之中。
      // minChunkSize：设置chunk的最小大小。
      // 在合并chunk时，webpack会尝试识别出具有重复模块的chunk，并优先进行合并。任何模块都不会被合并到entry chunk 中，以免影响初始页面加载时间。
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 5,
        // 单位kb
        minChunkSize: 100,
      }),
    ];
    config.plugins = [...config.plugins, ...plugins];
  },

};
