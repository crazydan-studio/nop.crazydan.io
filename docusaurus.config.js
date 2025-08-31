const localPlantUML = require('@mstroppel/remark-local-plantuml');
const math = require('remark-math');
const katex = require('rehype-katex');

module.exports = {
  title: 'Nop 开发实践',
  url: 'https://nop.crazydan.io',
  baseUrl: '/',
  favicon: 'img/logo.png',
  projectName: 'nop.crazydan.io',
  organizationName: 'Crazydan Studio',
  i18n: {
    defaultLocale: 'zh',
    locales: ['zh']
  },
  themeConfig: {
    navbar: {
      title: 'Nop 开发实践',
      logo: {
        alt: 'Nop 开发实践',
        src: 'img/logo.png'
      },
      items: [
        {
          to: 'docs/',
          activeBasePath: 'docs',
          label: '文档',
          position: 'right'
        },
        {
          type: 'dropdown',
          label: '源代码',
          position: 'right',
          items: [
            {
              label: 'Nop @Github',
              href: 'https://github.com/entropy-cloud/nop-entropy'
            },
            {
              label: 'Nop @Gitee',
              href: 'https://gitee.com/canonical-entropy/nop-entropy'
            }
          ]
        },
        {
          label: '开源社区',
          href: 'https://nop-platform.github.io',
          position: 'right'
        },
        {
          type: 'dropdown',
          label: '资源分享',
          position: 'right',
          items: [
            {
              label: 'Nop 组件包仓库（第三方）',
              href: 'https://nop.repo.crazydan.io'
            }
          ]
        }
      ]
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '我们',
          items: [
            {
              label: 'Crazydan Studio',
              href: 'https://studio.crazydan.org'
            }
          ]
        },
        {
          title: 'Nop 平台',
          items: [
            {
              label: '理论基础',
              href: 'https://zhuanlan.zhihu.com/p/64004026'
            }
          ]
        }
      ],
      copyright:
        '版权所有 © 2024 <a href="https://studio.crazydan.org">Crazydan Studio</a><br>本站通过 <a href="https://v2.docusaurus.io/">Docusaurus 2</a> 构建'
    },
    // https://github.com/flexanalytics/plugin-image-zoom
    imageZoom: {
      // CSS selector to apply the plugin to, defaults to '.markdown img'
      selector: '.markdown img, .project img',
      // Optional medium-zoom options
      // see: https://www.npmjs.com/package/medium-zoom#options
      options: {
        background: 'rgba(0, 0, 0, 0.5)',
        margin: 32,
        scrollOffset: 1000000
      }
    },
    // https://giscus.app/zh-CN
    // https://www.alanwang.site/posts/blog-guides/docusaurus-comment
    giscus: {
      repo: 'crazydan-studio/nop.crazydan.io',
      repoId: 'R_kgDOLmienA',
      category: 'Announcements',
      categoryId: 'DIC_kwDOLmienM4CeUE1'
    },
    prism: {
      theme: require('./src/theme/prism/prismLight'),
      darkTheme: require('./src/theme/prism/prismDark'),
      // https://docusaurus.io/docs/markdown-features/code-blocks#supported-languages
      // https://github.com/FormidableLabs/prism-react-renderer/blob/master/packages/generate-prism-languages/index.ts#L9-L23
      additionalLanguages: ['bash', 'yaml', 'java', 'latex', 'log']
    }
  },
  clientModules: [require.resolve('./src/clientModules/routeModules.ts')],
  stylesheets: [
    {
      href: '/katex/katex.min.css',
      type: 'text/css'
    }
  ],
  plugins: ['plugin-image-zoom'],
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        },
        blog: false,
        docs: {
          id: 'default',
          routeBasePath: 'docs',
          path: 'docs',
          sidebarPath: require.resolve('./docs/sidebars.js'),
          editUrl:
            'https://github.com/crazydan-studio/nop.crazydan.io/edit/master',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          // https://github.com/mstroppel/remark-local-plantuml/#integration
          remarkPlugins: [localPlantUML, math],
          // https://docusaurus.io/docs/2.x/markdown-features/math-equations#configuration
          rehypePlugins: [katex]
        }
      }
    ]
  ],
  themes: [
    // https://github.com/easyops-cn/docusaurus-search-local?tab=readme-ov-file#usage
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        indexBlog: false,
        indexDocs: true,
        docsRouteBasePath: '/',
        language: ['zh', 'en']
      }
    ]
  ]
};
