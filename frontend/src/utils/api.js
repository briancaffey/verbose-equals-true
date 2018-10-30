const mocks = {
  auth: { POST: { token: 'This-is-a-mocked-token' } },
  'user/me': { GET: { name: 'doggo', title: 'sir' } },
};
/* eslint no-unused-vars: ["error", { "args": "none" }] */
const apiCall = ({ url, method, ...args }) => new Promise((resolve, reject) => { // no-unused-vars
  setTimeout(() => {
    try {
      resolve(mocks[url][method || 'GET']);
    } catch (err) {
      reject(new Error(err));
    }
  }, 1000);
});

export default apiCall;
