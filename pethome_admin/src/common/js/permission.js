import Vue from 'vue';
// 注册一个全局自定义指令 `v-perm`
Vue.directive('perm', {
    // 当被绑定的元素插入到 DOM 中时……
    inserted: (el, binding, vnode) => {
        //获取自定义标签v-perm的值
        const value = binding.value;
        //json格式字符串
        let permissions = localStorage.getItem('permissions');
        if (permissions) {
            //转成json对象
            let auths = JSON.parse(permissions);
            //将数组中的每一个元素按照,号进行拼接  然后 再检索
            if (auths.join(",").indexOf(value) == -1) {
                //如果不包含权限就移除
                el.parentNode.removeChild(el);
            }
        }
    }
});