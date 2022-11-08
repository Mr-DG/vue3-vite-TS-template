// ------配置别名-------
import { fileURLToPath, URL } from 'node:url'
// ------配置vite------
import { defineConfig, loadEnv } from 'vite'
// ------转译.vue文件和jsx文件------
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
// ------自动按需引入vue\vue-router\pinia等的api------
import AutoImport from 'unplugin-auto-import/vite'
// ------动按需引入第三方的组件库组件和我们自定义的组件------
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
// ------打包压缩------
import viteCompression from 'vite-plugin-compression'
// ------svg配置------
import svgLoader from 'vite-svg-loader'

// ------获取别名路径------
const getPath = (path: string) => fileURLToPath(new URL(path, import.meta.url))

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {

  // 获取环境变量
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [
      vue(),
      vueJsx(),
      // ------自动按需引入api------
      AutoImport({
        imports: ['vue', 'vue-router'], // 自动导入vue和vue-router相关函数
        dts: 'src/types/auto-import.d.ts', // 生成 `auto-import.d.ts` 全局声明
      }),
      // ------自动按需引入组件------
      Components({
        dts: './src/types/components.d.ts', // 生成 `components.d.ts` 全局声明
        dirs: ['src/components'], // 用于搜索组件的目录相对路径
        resolvers: [AntDesignVueResolver()] // Ant Design Vue 按需引入
      }),
      // ------打包压缩------
      viteCompression({
        verbose: true,     // 是否在控制台输出压缩结果
        disable: false,    // 是否禁用
        threshold: 10240,  // 体积大于多少才压缩，单位b
        algorithm: 'gzip', // 压缩算法(['gzip' , 'brotliCompress' ,'deflate' , 'deflateRaw'])
        ext: '.gz',        // 压缩包后缀
        deleteOriginFile: false // 压缩后是否删除源文件
      }),
      svgLoader()
    ],
    resolve: {
      // ------配置别名------
      alias: {
        '@': getPath('./src'),
        'components': getPath('./src/components'),
        'assets': getPath('./src/assets'),
        'stores': getPath('./src/stores'),
        'views': getPath('./src/views')
      }
    },
    // ------服务配置------
    server: {
      host: true, // host设置为true才可以使用network的形式，以ip访问项目
      port: 8080, // 端口号
      open: true, // 自动打开浏览器
      cors: true, // 跨域设置允许
      strictPort: true, // 如果端口已占用直接退出
      // 接口代理
      proxy: {
        '/api': {
          // target: 'http://localhost:3001/',  // 本地 8080 前端代码的接口 代理到 3001 的服务端口
          target: env.VITE_PROXY_URL || 'http://localhost:3001/',
          changeOrigin: true, // 允许跨域
          rewrite: (path) => path.replace('/api/', '/'),
        },
      },
    },
    // ------打包配置------
    build: {
      chunkSizeWarningLimit: 2000, // 消除打包大小超过500kb警告
      // 在生产环境移除console.log
      terserOptions: {
        compress: {
          drop_console: true,
          pure_funcs: ['console.log', 'console.info'],
          drop_debugger: true,
        },
      },
      // 静态资源打包到dist下的不同目录
      assetsDir: 'static/assets',
      rollupOptions: {
        output: {
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
        },
      },
    },
    // ------支持less------
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true
        }
      }
    }
  }
})
