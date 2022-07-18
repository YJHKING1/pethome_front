axios.defaults.baseURL = "http://localhost:8080";
Vue.prototype.$http = axios
// 前置拦截器
axios.interceptors.request.use(res => {
    let token = localStorage.getItem("token");
    if (token) {
        res.headers["token"] = token;
    }
    return res;
}, error => {
    Promise.reject(error)
})
// 后置拦截器
axios.interceptors.response.use(res => {
    //后端响应的是没有登录的信息
    if (false === res.data.success && "noLogin" === res.data.message) {
        localStorage.removeItem("token");
        localStorage.removeItem("logininfo");
        location.href = "login.html";
    }
    return res;
}, error => {
    Promise.reject(error)
})
// 拦截非axios请求
let url = location.href;
if (url.indexOf("login.html") == -1 && url.indexOf("register.html") == -1 && url.indexOf("callback.html") == -1
    && url.indexOf("binder.html") == -1) {
    var logininfoStr = localStorage.getItem("logininfo");
    if (!logininfoStr) {
        location.href = "login.html";
    }
}

function parseUrlParams2Obj(url) {
    let paramStr = url.substring(url.indexOf("?") + 1);//xxx?code=xxx&state=1
    let paramArr = paramStr.split("&");
    let paramObj = {};
    for (let i = 0; i < paramArr.length; i++) {
        let paramTemp = paramArr[i];
        let paramName = paramTemp.split("=")[0];
        let paramValue = paramTemp.split("=")[1];
        paramObj[paramName] = paramValue;
    }
    return paramObj;
}