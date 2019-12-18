const axios =require('axios');
const configs=require('./index')
axios.defaults.baseURL = configs.WxUrl;
/* 设置请求头部数据格式 */
/* ================================================== */
axios.interceptors.request.use(
    config => {
        return config;
    },
    error => {
        return Promise.reject(error);
    });

/*设置返回的数据格式 */
/* ================================================== */
axios.interceptors.response.use(
    response => {
        return response.data;
    }, error => {
        return Promise.reject(error);
    });

module.exports=axios;
