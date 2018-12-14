const endpoints = [
  {
    "url-display": "/api/posts/",
    "url": "/api/posts/",
    "name": "Posts List",
    "status": "complete",
    "type": "success",
    "description": "A list of all Post objects",
    "method": "GET"
  },
  {
    "url-display": "/api/posts/<int:pk>/",
    "url": "/api/posts/1",
    "name": "Post Detail",
    "status": "complete",
    "type": "success",
    "description": "Details for a single post",
    "method": "GET"
  },
  {
    "url-display": "/api/account/",
    "url": "/api/account/",
    "name": "Account Detail",
    "status": "complete",
    "type": "success",
    "description": "Details for the current user's account",
    "method": "GET"
  },
  {
    "url-display": "/api/auth/obtain_token/",
    "url": "/api/auth/obtain_token/",
    "name": "Obtain JWT",
    "status": "complete",
    "type": "success",
    "description": "Returns Authentication JWT when credentials are provided",
    "method": "POST"
  },
]

export default endpoints;