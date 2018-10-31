import axios from 'axios';
import store from '../store';

/* eslint no-unused-vars: ["error", { "args": "none" }] */
const apiCall = axios.create();

apiCall.interceptors.request.use(
  config => {
    // Do something before each request is sent
    if (store.getters.isAuthenticated) {
      // Take the token from the state and attach it to the request's headers
      config.headers.Authorization = `JWT ${store.getters.getToken}`;
    }
    return config
  },
  error => {
    // Do something with the request error
    Promise.reject(error)
  }
)

export default apiCall;
