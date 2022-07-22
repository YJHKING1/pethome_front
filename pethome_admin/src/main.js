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
// 引入全局自定义Vue指令
import '@/common/js/permission'
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
    // "{\"success\":false,\"message\":\"noLogin\"}"
    // 跳转登录页面
    if (!res.data.success && res.data.message == 'noLogin') {
        localStorage.removeItem("token");
        localStorage.removeItem("logininfo");
        localStorage.removeItem("permissions");
        localStorage.removeItem("menus");
        // 跳转到登录页面
        router.push({path: '/login'});
        // 无权访问时的拦截
    } else if (!res.data.success && res.data.message == 'noPermission') {
        alert("你没有权限访问该资源!!!")
        // 过期时的拦截
    } else if (!res.data.success && res.data.message == 'timeout') {
        // 删除信息
        localStorage.removeItem("token");
        localStorage.removeItem("logininfo");
        localStorage.removeItem("permissions");
        localStorage.removeItem("menus");
        alert("登录过期，请重新登录!!!");
        router.push({path: '/login'});
    }
    return res;
}, error => {
    Promise.reject(error);
})
// 路由拦截器
router.beforeEach((to, from, next) => {
    if (to.path == '/login' || to.path == "/register") {
        // 放行
        next();
    } else {
        let logininfo = localStorage.getItem('logininfo');
        if (logininfo) {
            next();
        } else {
            // 跳转到login
            next({path: '/login'});
        }
    }
})
// 处理页面刷新动态路由失效问题
initIndexRouters();

function initIndexRouters() {
    if (!localStorage.menus) {
        return;
    }
    //防止重复配置路由：5就是main.js中路由的个数 - 如果你的静态路由是6个这里要写成6
    if (router.options.routes.length > 6) {
        return;
    }
    let menus = localStorage.getItem('menus');
    menus = JSON.parse(menus);
    let tempRouters = [];
    menus.forEach(menu => {
        let indexRouter = {
            path: '/',
            iconCls: menu.icon,
            name: menu.name,
            component: resolve => require(['@/views/Home'], resolve),
            children: []
        }
        menu.children.forEach(cMenu => {
            let cr = {
                path: cMenu.url,
                name: cMenu.name,
                component: resolve => require(['@/views/' + cMenu.component], resolve)
            }
            indexRouter.children.push(cr)
        })
        tempRouters.push(indexRouter)
        router.options.routes.push(indexRouter)
    })
    //动态路由配置
    router.addRoutes(tempRouters);
}

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')

