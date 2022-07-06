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

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')

