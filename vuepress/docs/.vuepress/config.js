module.exports = {
  title: 'Verbose Equals True',
  base: '/docs/',
  port: 8082,
  serviceWorker: false,
  themeConfig: {
    sidebar: 'auto',
    nav: [
      {
        text: 'Languages',
        items: [
          { text: 'Group1', link: '/guide/' },
          // { text: 'Group1', items: [''] },
          // { text: 'Group2', items: [''] }
        ]
      },
      { text: 'Home', link: '/' },
      { text: 'Start Here', link: '/start/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'View Site', link: 'http://localhost/' },
    ]
  }
}