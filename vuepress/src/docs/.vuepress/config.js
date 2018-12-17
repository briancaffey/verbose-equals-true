module.exports = {
  title: 'Verbose Equals True',
  themeConfig: {
    sidebar: [
      '/',
      '/page-a',
      ['/page-b', 'Explicit link text']
    ],
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Start Here', link: '/start/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'External', link: 'https://google.com' },
    ]
  }
}