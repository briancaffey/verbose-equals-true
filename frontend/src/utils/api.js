import axios from 'axios';
import store from '../store';

/* eslint no-unused-vars: ["error", { "args": "none" }] */
const apiCall = axios.create();

apiCall.interceptors.request.use(
  config => {
    // Do something before each request is sent
    if (store.getters.token) {
      // Attach a token to the header
      config.headers['JWT'] = store.token
    }
    return config
  },
  error => {
    // Do something with the request error
    Promise.reject(error)
  }
)

export default apiCall;
