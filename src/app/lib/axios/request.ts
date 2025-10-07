import axios from 'axios';

const config = {};

const Request = axios.create(config);

Request.interceptors.request.use(
  (request) => request,
  (error) => Promise.reject(error)
);

Request.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default Request;
