// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from 'prism-react-renderer'

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'State Management Collection',
  tagline: '跟着我从0-1实现状态管理库',
  favicon: 'img/logo.png',

  // Set the production url of your site here
  url: 'https://juejin.q-u-n.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'q-u-n', // Usually your GitHub org/user name.
  projectName: 'state-management-collection', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: '/',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/q-u-n/state-management-collection/tree/main/website/',
        },
        theme: {
          customCss: './custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'State Management Collection',
        items: [
          {
            to: '/jotai',
            label: 'Jotai',
            position: 'right',
          },
          { to: '/zustand', label: 'Zustand', position: 'right' },
          { to: '/valtio', label: 'Valtio', position: 'right' },
          { to: '/react-query', label: 'React-Query', position: 'right' },
          {
            href: 'https://github.com/q-u-n/state-management-collection.git',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [],
        copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
      algolia: {
        appId: '9DK1UPMTNU',
        apiKey: '66a231b604075429d52bd5b90ea702f7',
        indexName: 'juejin-q-u-n',
      },
    }),
}

export default config
