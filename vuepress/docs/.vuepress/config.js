module.exports = {
  title: 'Verbose Equals True',
  base: '/docs/',
  port: 8082,
  serviceWorker: false,
  themeConfig: {
    sidebar: 'auto',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Start Here', link: '/start/' },
      {
        text: 'Guide',
        items: [
          { text: 'Project Setup', link: '/guide/project-setup/' },
          { text: 'Backend API', link: '/guide/django-rest-framework/' },
          { text: 'Vue App', link: '/guide/vue-app/' },
          { text: 'Connecting Backend & Frontend', link: '/guide/connecting-backend-frontend/' },
          { text: 'NGINX', link: '/guide/nginx/' },
          { text: 'Celery & Redis', link: '/guide/celery-and-redis/' },
          { text: 'Production Environment', link: '/guide/production-environment/' },
          { text: 'Vue Authentication', link: '/guide/vue-authentication/' },

        ]},
      { text: 'View Site', link: 'http://localhost/' },
    ]
  }
}