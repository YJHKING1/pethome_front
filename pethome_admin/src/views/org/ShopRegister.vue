<template>
    <div>
        <!--
          el-form  - 表单
          :model="shop" - 与模型数据绑定
          ref="shopForm" - 给form取一个名字，方便验证数据格式
          :rules="formRules" - 校验规则
          label-position="left" - 标签位置靠左
          label-width="100px" - 标签宽度100px
          class="demo-ruleForm login-container" - 不用管
        -->
        <!--
          el-form-item - 表单项
            prop="name" - 如果当前字段要进行校验，就必须写，出现*
            label="名称" - 标签名

          el-input - 输入框
            type="text" - 文本框
            v-model="shop.name"  - 数据双向绑定
            auto-complete="off"  - 关闭自动完成
            placeholder="请输入店铺名称！" - 提示语
        -->
        <el-form :model="shop" ref="shopForm" :rules="formRules" label-position="left" label-width="100px"
                 class="demo-ruleForm login-container">
            <h3 class="title">店铺入驻</h3>
            <el-form-item prop="name" label="名称">
                <el-input type="text" v-model="shop.name" auto-complete="off" placeholder="请输入店铺名称！"></el-input>
            </el-form-item>
            <el-form-item prop="tel" label="座机">
                <el-input type="text" v-model="shop.tel" auto-complete="off" placeholder="请输入座机！"></el-input>
            </el-form-item>
            <el-form-item prop="address" label="店铺地址">
                <el-input type="text" v-model="shop.address" auto-complete="off" placeholder="请输入地址！"></el-input>
                <el-button size="small" type="primary" @click="selectAdrress">选择</el-button>
            </el-form-item>
            <el-form-item prop="logo" label="店铺Logo">
                <!--
                :on-preview="handlePreview" - 点击图片名时触发此函数 - 可以在这里做放大功能，这里不做
                :on-remove="handleRemove" - 点击删除时触发
                :on-success="handleSuccess" - 上传成功之后触发
                :file-list="fileList" - 文件列表
                action="http://localhost:8080/fastDfs/" - 文件上传接口地址
                -->
                <el-upload class="upload-demo"
                           action="http://localhost:8080/fastDfs/"
                           :on-preview="handlePreview"
                           :on-remove="handleRemove"
                           :on-success="handleSuccess"
                           :file-list="fileList"
                           list-type="picture">
                    <el-button size="small" type="primary">点击上传</el-button>
                    <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                </el-upload>
            </el-form-item>
            <h3 class="title">管理员信息设置</h3>
            <el-form-item prop="employee.username" label="账号">
                <el-input type="text" v-model="shop.employee.username" auto-complete="off"
                          placeholder="请输入账号！"></el-input>
            </el-form-item>
            <el-form-item prop="employee.phone" label="手机号码">
                <el-input type="text" v-model="shop.employee.phone" auto-complete="off"
                          placeholder="请输入电话！"></el-input>
            </el-form-item>
            <el-form-item prop="employee.email" label="电子邮件">
                <el-input type="text" v-model="shop.employee.email" auto-complete="off"
                          placeholder="请输入邮件！"></el-input>
            </el-form-item>
            <el-form-item prop="employee.password" label="密码">
                <el-input type="password" v-model="shop.employee.password" auto-complete="off"
                          placeholder="请输入密码！"></el-input>
            </el-form-item>
            <el-form-item prop="employee.comfirmPassword" label="确认密码">
                <el-input type="password" v-model="shop.employee.comfirmPassword" auto-complete="off"
                          placeholder="请输入确认密码！"></el-input>
            </el-form-item>
            <el-form-item style="width:100%;">
                <el-button type="primary" style="width:100%;" @click.native.prevent="settledIn">入驻</el-button>
            </el-form-item>
        </el-form>
        <!--百度地图-->
        <el-dialog
            title="选择地址"
            :visible.sync="dialogVisable"
            width="30%">
            <baidu-map :center="{lng: 104.06, lat: 30.67}" :zoom="11">
                <bm-view class="map"></bm-view>
                <bm-control :offset="{width: '10px', height: '10px'}">
                    <bm-auto-complete v-model="keyword" :sugStyle="{zIndex: 2100}">
                        <div style="margin-bottom:10px">
                            <input id="searchInput" type="text" placeholder="请输入关键字" class="searchinput"/>
                            <el-button type="success" @click="selectAddressConfirm">确定</el-button>
                        </div>
                    </bm-auto-complete>
                </bm-control>
                <bm-local-search :keyword="keyword" :auto-viewport="true"></bm-local-search>
            </baidu-map>
            <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisable=false">关 闭</el-button>
                <!--<el-button type="primary" @click="dialogVisable=false">确 定</el-button>-->
          </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    //模型数据
    data() {
        //验证规则：两次密码一致
        var validatePass2 = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请再次输入密码'))
            } else if (value !== this.shop.employee.password) {
                callback(new Error('两次输入密码不一致!'))
            } else {
                callback()
            }
        }

        return {
            //百度地图相关数据：
            keyword: '',
            dialogVisable: false,

            //文件上传相关数据
            fileList: [],

            //店铺入驻表单数据
            shop: {
                employee: {
                    username: "",
                    phone: "",
                    email: "",
                    password: "",
                    comfirmPassword: ""
                },
                name: '',
                tel: '',
                address: '',
                logo: '',
            },

            //表单验证规则
            formRules: {
                name: [
                    {required: true, message: '请输入店铺名称!', trigger: 'blur'}
                ],
                tel: [
                    {required: true, message: '请输入店铺座机!', trigger: 'blur'}
                ],
                address: [
                    {required: true, message: '请输入店铺地址!', trigger: 'blur'}
                ],
                'employee.phone': [
                    {required: true, message: '请输入手机号!', trigger: 'blur'}
                ],
                logo: [
                    {required: true, message: '请输入店铺logo!', trigger: 'blur'}
                ],
                'employee.email': [
                    {type: 'email', required: true, message: '请输入邮箱!', trigger: 'blur'}
                ],
                'employee.username': [
                    {required: true, message: '请输入账号!', trigger: 'blur'}
                ],
                'employee.password': [
                    {required: true, message: '请输入密码!', trigger: 'blur'}
                ],
                'employee.comfirmPassword': [
                    {required: true, validator: validatePass2, trigger: 'blur'} //调用自定义校验规则
                ]
            }
        };
    },
    //方法
    methods: {

        //百度地址的业务逻辑
        selectAddressConfirm() {
            //获取值搜索框值,设置给地址
            var searchInputV = document.getElementById("searchInput").value;
            this.shop.address = searchInputV;
            //关闭对话框
            this.dialogVisable = false;
        },
        selectAdrress() {
            this.dialogVisable = true;
        },

        // 文件上传的业务逻辑
        handleSuccess(response, file, fileList) {
            this.shop.logo = response.resultObj;
        },
        // 文件删除的业务逻辑
        handleRemove(file, fileList) {
            // Object {response: Object { success: true, message: "操作成功", resultObj: "/group1/M00/00/0F/oYYBAGJ6JmyATaYbAAk1mWiyf0E903.gif" }}
            console.log(file);
            var filePath = file.response.resultObj;
            this.$http.delete("/fastDfs?path=" + filePath).then(res => {
                if (res.data.success) {
                    this.$message({
                        message: '删除成功!',
                        type: 'success'
                    });
                } else {
                    this.$message({
                        message: '删除失败!',
                        type: 'error'
                    });
                }
            })
        },

        //图片预览
        handlePreview(file) {
            console.log(file);
        },

        //点击入驻按钮的业务逻辑
        settledIn() {
            this.$refs.shopForm.validate((valid) => {
                //校验表单成功后才做一下操作
                if (valid) {
                    this.$confirm('确认入驻吗？', '提示', {}).then(() => {
                        //拷贝后面对象的值到新对象,防止后面代码改动引起模型变化
                        let para = Object.assign({}, this.shop); //shop本身这个参数里面就有店铺和管理员信息
                        //为了后台好接收，封装一个对象放到里面
                        this.$http.post("/shop/settlement", para).then((res) => {
                            if (res.data.success) {
                                this.$message({
                                    message: '操作成功!',
                                    type: 'success'
                                });
                                //重置表单
                                this.$refs['shopForm'].resetFields();
                                //跳转登录页面
                                this.$router.push({path: '/login'});
                            } else {
                                this.$message({
                                    message: res.data.msg,
                                    type: 'error'
                                });
                            }
                        });
                    });
                }
            })
        }
    }
}

</script>
<style lang="scss" scoped>
.login-container {
    -webkit-border-radius: 5px;
    border-radius: 5px;
    -moz-border-radius: 5px;
    background-clip: padding-box;
    margin: 180px auto;
    width: 500px;
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

.map {
    width: 100%;
    height: 300px;
}

.searchinput {
    width: 300px;
    box-sizing: border-box;
    padding: 9px;
    border: 1px solid #dddee1;
    line-height: 20px;
    font-size: 16px;
    height: 38px;
    color: #333;
    position: relative;
    border-radius: 4px;
}
</style>