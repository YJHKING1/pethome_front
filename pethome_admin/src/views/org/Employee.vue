<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true">
                <el-form-item>
                    <el-input v-model="keyword" placeholder="姓名关键字"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="keywordQuery">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>
        <!--列表-->
        <el-table :data="employees" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
                  style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" label="序号" width="60">
            </el-table-column>
            <el-table-column prop="id" label="id" width="60" sortable>
            </el-table-column>
            <el-table-column prop="username" label="姓名" width="100" sortable>
            </el-table-column>
            <el-table-column prop="phone" label="电话" width="150" sortable>
            </el-table-column>
            <el-table-column prop="email" label="电邮" width="150" sortable>
            </el-table-column>
            <el-table-column prop="age" label="年纪" width="100" sortable>
            </el-table-column>
            <el-table-column prop="logininfoId" label="登录Id" width="100" sortable>
            </el-table-column>
            <el-table-column prop="department.name" label="部门" width="100" sortable>
            </el-table-column>
            <el-table-column prop="shop.name" label="店铺" width="100" sortable>
            </el-table-column>
            <el-table-column prop="state" label="状态" width="100" sortable>
                <template scope="scope">
                    <span v-if="scope.row.state==1" style="color: green">正常</span>
                    <span v-else style="color: red">停用</span>
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template scope="scope">
                    <el-button type="success" size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :current-page="currentPage"
                           :page-size="pageSize" :total="totals" style="float:right;">
            </el-pagination>
        </el-col>
        <!--编辑界面-->
        <el-dialog :title="title" :visible.sync="saveFormVisible" :close-on-click-modal="false">
            <el-form :model="saveForm" label-width="80px" :rules="saveFormRules" ref="saveForm">
                <el-form-item prop="username" label="姓名">
                    <el-input v-model="saveForm.username"></el-input>
                </el-form-item>
                <el-form-item prop="phone" label="电话">
                    <el-input v-model="saveForm.phone"></el-input>
                </el-form-item>
                <el-form-item prop="email" label="电邮">
                    <el-input v-model="saveForm.email"></el-input>
                </el-form-item>
                <el-form-item prop="age" label="年纪">
                    <el-input-number v-model="saveForm.age"></el-input-number>
                </el-form-item>
                <el-form-item prop="departmentId" label="部门">
                    <el-select v-model="saveForm.departmentId" value-key="id" placeholder="请选择经理" clearable>
                        <el-option v-for="item in departments" :label="item.name" :value="item">
                            <span style="float: left">{{ item.name }}</span>
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item prop="shopId" label="店铺">
                    <el-select v-model="saveForm.shopId" value-key="id" placeholder="请选择经理" clearable>
                        <el-option v-for="item in shops" :label="item.name" :value="item">
                            <span style="float: left">{{ item.name }}</span>
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item prop="roleId" label="角色">
                    <el-select v-model="saveForm.roleId" value-key="id" placeholder="请选择角色" clearable>
                        <el-option v-for="item in roles" :label="item.name" :value="item.id">
                            <span style="float: left">{{ item.name }}</span>
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="启用状态">
                    <el-radio-group v-model="saveForm.state">
                        <el-radio class="radio" :label="1">正常</el-radio>
                        <el-radio class="radio" :label="0">停用</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="saveFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="saveSubmit" :loading="saveLoading">提交</el-button>
            </div>
        </el-dialog>
    </section>
</template>
<script>
export default {
    data() {
        return {
            filters: {
                name: ''
            },
            // 列表数据
            employees: [],
            // 加载框
            listLoading: false,
            // 总数
            totals: 0,
            // 当前页
            currentPage: 1,
            // 每页条数
            pageSize: 10,
            // 列表选中列
            sels: [],
            title: "",
            // 部门集合
            departments: [],
            // 店铺集合
            shops: [],
            // 关键字
            keyword: '',
            // 角色
            roles: [],
            saveFormVisible: false,//编辑界面是否显示
            saveLoading: false,
            saveFormRules: {
                /*name: [
                    {required: true, message: '请输入部门名', trigger: 'blur'}
                ],
                sn: [
                    {required: true, message: '请输入编号', trigger: 'blur'}
                ]*/
            },
            //编辑界面数据
            saveForm: {
                id: null,
                username: '',
                phone: '',
                email: '',
                salt: '',
                password: '',
                age: 0,
                state: 0,
                departmentId: null,
                department: null,
                logininfoId: null,
                shopId: null,
                shop: null,
                roleId: null
            }
        }
    },
    methods: {
        // 点击页码
        handleCurrentChange(val) {
            this.currentPage = val;
            this.getEmployees();
        },
        // 关键字查询
        keywordQuery() {
            this.currentPage = 1;
            this.getEmployees();
        },
        // 经理集合
        getDepartments() {
            this.$http.get("/department").then(res => {
                this.departments = res.data;
            });
        },// 经理集合
        getShops() {
            this.$http.get("/shop").then(res => {
                this.shops = res.data;
            });
        },
        // 获取员工列表
        getEmployees() {
            let para = {
                "currentPage": this.currentPage,
                "pageSize": this.pageSize,
                "keyword": this.keyword
            };
            // 显示盲等框
            this.listLoading = true;
            this.$http.post("/employee", para).then(res => {
                // 赋值总数
                this.totals = res.data.totals;
                // 赋值分页
                this.employees = res.data.data;
                // 关闭盲等框
                this.listLoading = false;
            }).catch(res => {
                this.$message.error("网络繁忙，请稍后再试");
            });
        },
        // 获取角色列表
        getRules() {
            this.$http.get("/role").then(res => {
                this.roles = res.data;
            });
        },
        // 删除点击事件
        handleDel: function (index, row) {
            // 弹出确认框
            this.$confirm('确认删除该记录吗?', '提示', {
                // 确认框类型
                type: 'warning'
                // 确定事件
            }).then(() => {
                // 显示等待圈
                this.listLoading = true;
                // 发送异步请求
                this.$http.delete("/employee/" + row.id).
                    // 请求成功
                    then(res => {
                        // 关闭等待圈
                        this.listLoading = false;
                        // 返回信息：成功
                        if (res.data.success) {
                            // 总页数
                            let totalPage = Math.ceil(this.totals / this.pageSize);
                            // 如果当前页为最后一页且当前条数为最后一条且当前页不为第一页
                            if (this.currentPage == totalPage && (this.totals - 1) % this.pageSize == 0 && this.currentPage != 1) {
                                this.currentPage = this.currentPage - 1;
                            }
                            // 显示信息
                            this.$message.success("删除成功");
                            // 再次查询
                            this.getEmployees();
                            // 返回信息：失败
                        } else {
                            // 显示信息
                            this.$message.error("网络繁忙，500");
                        }
                        // 请求失败
                    }).catch(res => {
                    // 显示信息
                    this.$message.error("网络繁忙，400，404");
                });
                // 取消事件
            }).catch(() => {
            });
        },
        //显示编辑界面
        handleEdit: function (index, row) {
            this.title = "编辑";
            // 备份数据
            this.saveForm = Object.assign({}, row);
            this.getDepartments()
            this.getShops();
            this.getRules();
            // 显示修改对话框
            this.saveFormVisible = true;
        },
        //显示新增界面
        handleAdd: function () {
            this.title = "新增";
            // 赋空值
            this.saveForm = {
                id: null,
                username: '',
                phone: '',
                email: '',
                salt: '',
                password: '',
                age: 0,
                state: 0,
                departmentId: null,
                department: null,
                logininfoId: null,
                shopId: null,
                shop: null,
                roleId: null
            };
            this.getDepartments()
            this.getShops();
            this.getRules();
            // 显示修改对话框
            this.saveFormVisible = true;
        },
        //编辑
        saveSubmit: function () {
            this.$refs.saveForm.validate((valid) => {
                if (valid) {
                    this.$confirm('确认提交吗？', '提示', {}).then(() => {
                        this.saveLoading = true;
                        // 此为表单中的数据
                        let paras = Object.assign({}, this.saveForm);
                        paras.shopId = this.saveForm.shopId.id;
                        paras.departmentId = this.saveForm.departmentId.id;
                        paras.department = null;
                        paras.shop = null;
                        this.$http.put("/employee", paras).then(res => {
                            this.saveFormVisible = false;
                            this.saveLoading = false;
                            if (res.data.success) {
                                this.$message.success(this.title + "成功");
                                this.getEmployees();
                            } else {
                                this.$message.error("网络繁忙，500");
                            }
                        }).catch(res => {
                            // 显示信息
                            this.$message.error("网络繁忙，400，404");
                        });
                    });
                }
            });
        },
        selsChange: function (sels) {
            this.sels = sels;
        },
        //批量删除
        batchRemove: function () {
            var ids = this.sels.map(item => item.id);
            this.$confirm('确认删除选中记录吗？', '提示', {
                type: 'warning'
            }).then(() => {
                this.listLoading = true;
                // 发送异步请求
                this.$http.patch("/employee", ids).
                    // 请求成功
                    then(res => {
                        // 关闭等待圈
                        this.listLoading = false;
                        // 返回信息：成功
                        if (res.data.success) {
                            // 批量删除成功则回到第一页
                            this.currentPage = 1;
                            // 显示信息
                            this.$message.success("删除成功");
                            // 再次查询
                            this.getEmployees();
                            // 返回信息：失败
                        } else {
                            // 显示信息
                            this.$message.error("网络繁忙，500");
                        }
                        // 请求失败
                    }).catch(res => {
                    // 显示信息
                    this.$message.error("网络繁忙，400，404");
                });
            }).catch(() => {
            });
        }
    },
    mounted() {
        this.getEmployees();
    }
}
</script>
<style scoped>
</style>