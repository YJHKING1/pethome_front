import babelpolyfill from 'babel-polyfill'
import Vue from 'vue'
import App from './App'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
import VueRouter from 'vue-router'
import store from './vuex/store'
import Vuex from 'vuex'
import routes from './routes'
import 'font-awesome/css/font-awesome.min.css'
//引入axios
import axios from "axios";
// 请求地址
axios.defaults.baseURL = "http://localhost:8080";
Vue.prototype.$http = axios
Vue.use(ElementUI)
Vue.use(VueRouter)
Vue.use(Vuex)
const router = new VueRouter({
    routes
})
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
        router.push({path: '/login'});
    }
    return res;
}, error => {
    Promise.reject(error)
})
// 路由拦截器
router.beforeEach((to, from, next) => {
    if (to.path == '/login' || to.path == '/register') {
        next();
    } else {//访问其他页面 - 判断是否登录过 - logininfo
        let logininfo = JSON.parse(localStorage.getItem('logininfo'));
        if (logininfo) {
            next();
        } else {//访问的不是登录页面，页不是注册页面。没有登录
            next({path: '/login'})
        }
    }
})
new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')

