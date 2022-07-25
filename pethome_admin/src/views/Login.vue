<template>
    <el-form :model="ruleForm2" :rules="rules2" ref="ruleForm2" label-position="left" label-width="0px"
             class="demo-ruleForm login-container">
        <h3 class="title">系统登录</h3>
        <el-form-item prop="account">
            <el-input type="text" v-model="ruleForm2.account" auto-complete="off" placeholder="账号"></el-input>
        </el-form-item>
        <el-form-item prop="checkPass">
            <el-input type="password" v-model="ruleForm2.checkPass" auto-complete="off" placeholder="密码"></el-input>
        </el-form-item>
        <el-checkbox v-model="checked" checked class="remember">记住密码</el-checkbox>
        <el-form-item style="width:100%;">
            <el-button type="primary" style="width:47%;" @click.native.prevent="handleSubmit2" :loading="logining">登录
            </el-button>
            <el-button type="primary" style="width:47%;" @click.native.prevent="goRegister">店铺入驻
            </el-button>
            <!--<el-button @click.native.prevent="handleReset2">重置</el-button>-->
        </el-form-item>
    </el-form>
</template>

<script>
import {requestLogin} from '../api/api';
//import NProgress from 'nprogress'
export default {
    data() {
        return {
            logining: false,
            ruleForm2: {
                account: '金虎大人',
                checkPass: '1',
                loginType: 0
            },
            rules2: {
                account: [
                    {required: true, message: '请输入账号', trigger: 'blur'},
                    //{ validator: validaePass }
                ],
                checkPass: [
                    {required: true, message: '请输入密码', trigger: 'blur'},
                    //{ validator: validaePass2 }
                ]
            },
            checked: true
        };
    },
    methods: {
        handleReset2() {
            this.$refs.ruleForm2.resetFields();
        },
        handleSubmit2(ev) {
            this.login();
        },
        goRegister() {
            this.$router.push({path: '/register'});
        },
        login() {
            this.$refs.ruleForm2.validate((valid) => {
                if (valid) {
                    // 显示忙等框
                    this.logining = true;
                    this.$http.post("/login/account", this.ruleForm2).then(res => {
                        // 不管失败和成功：都要去掉忙等框
                        this.logining = false;
                        if (res.data.success) {
                            //1.显示成功信息
                            this.$message({
                                message: "登录成功",
                                type: 'success'
                            });
                            //2.将token和logininfo保存到localStrorage中
                            //解构表达式：快捷获取
                            let {token, logininfo, menus, permissions} = res.data.resultObj;
                            // console.log("===============================================");
                            // console.log(res.data.resultObj);
                            // console.log(token);
                            // console.log(logininfo);
                            localStorage.setItem("token", token);
                            //注意：保存的是json格式的字符串，那么获取的时候需要进行转换才能使用json对象
                            //3.跳转到首页
                            localStorage.setItem("logininfo", JSON.stringify(logininfo));
                            //拿到的是一个对象，需要转成json格式字符串
                            localStorage.setItem("menus", JSON.stringify(menus));
                            localStorage.setItem("permissions", JSON.stringify(permissions));
                            this.$router.push({path: '/echarts'});
                            // 登录成功之后刷新一下本地的路由缓存
                            location.reload();
                        } else {
                            this.$message({
                                message: res.data.msg,
                                type: 'error'
                            });
                        }
                    }).catch(res => {
                        this.$message({
                            message: "系统错误",
                            type: 'error'
                        });
                    })
                } else {
                    console.log('验证不通过，提交失败!');
                    return false;
                }
            });
        }
    },
    mounted() {
        var logininfo = localStorage.getItem('logininfo');
        if (logininfo) {
            let logininfoObj = JSON.parse(logininfo);
            this.sysUserName = logininfoObj.username || logininfoObj.email || logininfoObj.phone || '';
            // this.sysUserAvatar = loginInfoObj.avatar || '';//显示管理员头像，表中没有设计
        }
    }
}

</script>

<style lang="scss" scoped>
.login-container {
    /*box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.06), 0 1px 0px 0 rgba(0, 0, 0, 0.02);*/
    -webkit-border-radius: 5px;
    border-radius: 5px;
    -moz-border-radius: 5px;
    background-clip: padding-box;
    margin: 180px auto;
    width: 350px;
    padding: 35px 35px 15px 35px;
    background: #fff;
    border: 1px solid #eaeaea;
    box-shadow: 0 0 25px #cac6c6;

    .title {
        margin: 0px auto 40px auto;
        text-align: center;
        color: #505458;
    }

    .remember {
        margin: 0px 0px 35px 0px;
    }
}
</style>