import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Canvas-Editor",
  description: "图片编辑器",
  themeConfig: {
    search: {
      provider: 'local'
    },
    i18nRouting: true,
    editLink: {
      pattern: 'https://github.com/JS-mark/canvas-editor-v2/issues',
      text: '欢迎帮助我们改善页面',
    },
    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    },
    // 分享链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/JS-mark/canvas-editor-v2/tree/main/packages/canvas-editor' },
    ],
    nav: [
      { text: '首页', link: '/' },
      { text: '快速上手', link: '/guide/index', activeMatch: '/guide/' },
      { text: '例子', link: '/examples/index', activeMatch: '/examples/' }
    ],
    // 底部信息
    footer: {
      message: `Released under the MIT License.`,
      copyright: 'Copyright © 2024 The Mark Contributors',
    },
    docFooter: { prev: '上一篇', next: '下一篇' },
    sidebar: {
      guide: [
        {
          text: '快速上手',
          items: [
            { text: '安装', link: '/guide/installation' },
            { text: '使用', link: '/guide/use' },
            { text: '使用 UMD', link: '/guide/use-umd' },
            { text: '开发插件', link: '/guide/plugins' },
          ]
        }
      ],
      examples: [
        {
          text: '示例 demo',
          items: [
            { text: 'Vue中使用', link: '/examples/vue' },
            { text: 'React中使用', link: '/examples/react' },
          ]
        }
      ]
    },
  }
})
