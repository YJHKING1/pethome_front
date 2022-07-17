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
                account: '',
                checkPass: '',
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
            this.$refs.ruleForm2.validate((valid) => {
                if (valid) {
                    this.logining = true;
                    this.$http.post("/login/account", this.ruleForm2).then(res => {
                        this.logining = false;
                        if (res.data.success) {
                            this.$message({
                                message: '登录成功',
                                type: 'success'
                            });
                            let {token, logininfo} = res.data.resultObj;
                            localStorage.setItem('token', token);
                            localStorage.setItem('logininfo', JSON.stringify(logininfo));
                            // 跳转主页
                            this.$router.push({path: '/echarts'});
                        } else {
                            this.$message({
                                message: res.data.msg,
                                type: 'error'
                            });
                        }
                    }).catch(res => {
                        this.$message({
                            message: "网络繁忙，请稍后再试",
                            type: 'error'
                        })
                    })
                } else {
                    this.$message.error("验证失败，请检查输入的信息");
                }
            });
        },
        goRegister() {
            this.$router.push({path: '/register'});
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