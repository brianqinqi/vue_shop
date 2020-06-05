module.exports = {
  chainWebpack: config => {
    // 发布
    config.when(process.env.NODE_ENV === 'production', config => {
      // 指定不同的入口文件
      config.entry('app').clear().add('./src/main_prod.js')
      // 优化加载的依赖项
      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
        nprogress: 'NProgress',
        'vue-quill-editor': 'VueQuillEditor'
      })
      // 指定不同的标题
      config.plugin('html').tap(args => {
        args[0].isProd = true
        return args
      })
    })
    // 开发
    config.when(process.env.NODE_ENV === 'development', config => {
      config.entry('app').clear().add('./src/main_dev.js')
      config.plugin('html').tap(args => {
        args[0].isProd = false
        return args
      })
    })
  }
}
