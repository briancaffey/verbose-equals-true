module.exports = {
  title: 'Verbose Equals True',
  serviceWorker: false,
  themeConfig: {
    sidebar: 'auto',
    nav: [
      {
        text: 'Languages',
        items: [
          { text: 'Group1', link: '/guide/' },
          { text: 'Group1', items: [''] },
          { text: 'Group2', items: [''] }
        ]
      },
      { text: 'Home', link: '/' },
      { text: 'Start Here', link: '/start/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'External', link: 'https://google.com' },
    ]
  }
}