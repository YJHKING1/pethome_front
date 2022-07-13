import Login from './views/Login.vue'
import NotFound from './views/404.vue'
import Home from './views/Home.vue'
import Main from './views/Main.vue'
import Table from './views/nav1/Table.vue'
import Form from './views/nav1/Form.vue'
import user from './views/nav1/user.vue'
import Page4 from './views/nav2/Page4.vue'
import Page5 from './views/nav2/Page5.vue'
import Page6 from './views/nav3/Page6.vue'
import echarts from './views/charts/echarts.vue'
import Department from "./views/org/Department";
import Employee from "./views/org/Employee";
import Shop from "./views/org/Shop";
import Systemdictionarydetail from "./views/system/Systemdictionarydetail";
import Systemdictionarytype from "./views/system/Systemdictionarytype";
import ShopRegister from "./views/org/ShopRegister";
import Activation from "./views/Activation";

let routes = [
    {
        path: '/login',
        component: Login,
        name: '',
        hidden: true
    },
    {
        path: '/404',
        component: NotFound,
        name: '',
        hidden: true
    },
    {
        path: '/register',
        component: ShopRegister,
        name: '',
        hidden: true
    }, {
        path: '/activation',
        component: Activation,
        name: '',
        hidden: true
    },
    {
        path: '/',
        component: Home,
        name: 'Charts',
        iconCls: 'fa fa-bar-chart',
        leaf: true,//只有一个节点
        children: [
            {path: '/echarts', component: echarts, name: '主页'}
        ]
    },
    {
        path: '/',
        component: Home,
        name: '组织机构',
        iconCls: 'el-icon-message',//图标样式class
        children: [
            {path: '/main', component: Main, name: '主页', hidden: true},
            {path: '/department', component: Department, name: '部门'},
            {path: '/employee', component: Employee, name: '员工'},
            {path: '/shop', component: Shop, name: '店铺'},
            {path: '/systemdictionarydetail', component: Systemdictionarydetail, name: '数据字典明细'},
            {path: '/systemdictionarytype', component: Systemdictionarytype, name: '数据字典类型'}
        ]
    },
    {
        path: '/',
        component: Home,
        name: '导航二',
        iconCls: 'fa fa-id-card-o',
        children: [
            {path: '/page4', component: Table, name: '页面4'},
            {path: '/page5', component: Table, name: '页面5'}
        ]
    },
    {
        path: '*',
        hidden: true,
        redirect: {path: '/404'}
    }
];

export default routes;