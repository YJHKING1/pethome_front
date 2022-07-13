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
                    <el-button type="primary" @click="handleAdd" disabled>新增</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="exportData">导出</el-button>
                </el-form-item>
                <el-form-item>
                    <!-- 默认name="file" -->
                    <el-upload class="upload-demo"
                               action="http://localhost:8080/shop/importExcel"
                               list-type="text">
                        <el-button type="warning">导入</el-button>
                    </el-upload>
                </el-form-item>
            </el-form>
        </el-col>
        <!--列表-->
        <el-table :data="shops" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
                  style="width: 100%;" @row-dblclick="openTable">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" label="序号" width="60">
            </el-table-column>
            <el-table-column prop="id" label="id" width="60" sortable>
            </el-table-column>
            <el-table-column prop="name" label="店名" width="100" sortable>
            </el-table-column>
            <el-table-column prop="tel" label="电话" width="150" sortable>
            </el-table-column>
            <el-table-column prop="employee.username" label="店长" width="100" sortable>
            </el-table-column>
            <el-table-column prop="state" label="状态" width="100" sortable>
                <template scope="scope">
                    <span v-if="scope.row.state==1" style="color: hotpink">待审核</span>
                    <span v-if="scope.row.state==2" style="color: blue">待激活</span>
                    <span v-if="scope.row.state==3" style="color: green">正常使用</span>
                    <span v-if="scope.row.state==4" style="color: red">驳回</span>
                </template>
            </el-table-column>
            <el-table-column prop="registerTime" label="注册时间" width="150" sortable>
            </el-table-column>
            <el-table-column prop="logo" label="图标" width="100" sortable>
                <template scope="scope">
                    <img :src="imgPrefix+scope.row.logo" width="50px" alt="">
                </template>
            </el-table-column>
            <el-table-column prop="address" label="地址" min-width="200" sortable>
            </el-table-column>
            <el-table-column label="操作">
                <template scope="scope">
                    <el-button type="success" size="small" @click="handleEdit(scope.$index, scope.row)" disabled>编辑
                    </el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除
                    </el-button>
                    <el-button type="warning" :disabled="scope.row.state!==1" size="small"
                               @click="handleAudit(scope.$index, scope.row)">店铺审核
                    </el-button>
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
                <el-form-item prop="name" label="姓名">
                    <el-input v-model="saveForm.name"></el-input>
                </el-form-item>
                <el-form-item prop="tel" label="电话">
                    <el-input v-model="saveForm.tel"></el-input>
                </el-form-item>
                <el-form-item prop="address" label="地址">
                    <el-input v-model="saveForm.address"></el-input>
                </el-form-item>
                <el-form-item prop="adminId" label="经理">
                    <el-select v-model="saveForm.adminId" value-key="id" placeholder="请选择经理" clearable>
                        <el-option v-for="item in managers" :label="item.username" :value="item">
                            <span style="float: left">{{ item.username }}</span>
                            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.phone }}</span>
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
        <!--抽屉-->
        <el-drawer
            :visible.sync="table"
            direction="rtl">
            <img :src="this.path" alt="">
        </el-drawer>
        <!-- 审核模态框 -->
        <el-dialog title="审核店铺" :visible.sync="shopAuditVisible" :close-on-click-modal="false">
            <el-form :model="shopAuditLog" label-width="80px" ref="shopAuditLogForm">
                <el-form-item label="备注" prop="note">
                    <el-input type="textarea" v-model="shopAuditLog.note"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="shopAuditVisible = false">取消</el-button>
                <el-button type="primary" @click.native="auditPass">通过</el-button>
                <el-button type="primary" @click.native="auditReject">驳回</el-button>
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
            shops: [],
            // 员工列表
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
            // 经理
            managers: [],
            // 关键字
            keyword: '',
            // 图标前缀
            imgPrefix: 'http://123.207.27.208',
            // 图标路径
            path: '',
            // 抽屉显示
            table: false,
            //审核模态框
            shopAuditVisible: false,
            // 编辑界面是否显示
            saveFormVisible: false,
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
                name: '',
                tel: '',
                registerTime: null,
                state: 0,
                address: '',
                logo: '',
                adminId: null,
                employee: null
            },
            //编辑界面数据
            shopAuditLog: {
                shopId: null,
                note: ''
            }
        }
    },
    methods: {
        // 点击页码
        handleCurrentChange(val) {
            this.currentPage = val;
            this.getShops();
        },
        // 关键字查询
        keywordQuery() {
            this.currentPage = 1;
            this.getShops();
        },
        // 经理集合
        getManagers() {
            this.$http.get("/employee").then(res => {
                this.managers = res.data;
            });
        },
        // 导出
        exportData() {
            //this.$router.push({ path: '/register' });
            location.href = "http://localhost:8080/shop/export";
        },
        // 打开抽屉
        openTable(row) {
            // 拼接图标前缀和路径
            this.path = this.imgPrefix + row.logo;
            // 打开抽屉
            this.table = true;
        },
        //点击店铺审核弹出模态框
        handleAudit(index, row) {
            this.shopAuditLog = {
                shopId: null,
                note: ''
            };
            this.shopAuditLog.shopId = row.id;
            this.shopAuditVisible = true;
        },
        //审核驳回
        auditReject() {
            this.$http.post("/shop/audit/reject", this.shopAuditLog).then(res => {
                if (res.data.success) {
                    this.$message({
                        message: '驳回成功',
                        type: 'success'
                    });
                } else {
                    this.$message({
                        message: '驳回失败',
                        type: 'error'
                    });
                }
                this.shopAuditVisible = false;
                this.getShops();
            })
        },
        //审核通过
        auditPass() {
            this.$http.post("/shop/audit/pass", this.shopAuditLog).then(result => {
                result = result.data;
                if (result.success) {
                    this.$message({
                        message: '审核通过',
                        type: 'success'
                    });
                } else {
                    this.$message({
                        message: '审核失败',
                        type: 'error'
                    });
                }
                this.shopAuditVisible = false;
                this.getShops();
            })
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
        // 获取店铺列表
        getShops() {
            let para = {
                "currentPage": this.currentPage,
                "pageSize": this.pageSize,
                "keyword": this.keyword
            };
            // 显示盲等框
            this.listLoading = true;
            this.$http.post("/shop", para).then(res => {
                // 赋值总数
                this.totals = res.data.totals;
                // 赋值分页
                this.shops = res.data.data;
                // 关闭盲等框
                this.listLoading = false;
            }).catch(res => {
                this.$message.error("网络繁忙，请稍后再试");
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
                this.$http.delete("/shop/" + row.id).
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
                            this.getShops();
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
            // 获取经理集合
            this.getManagers();
            // 显示修改对话框
            this.saveFormVisible = true;
        },
        //显示新增界面
        handleAdd: function () {
            this.title = "新增";
            // 赋空值
            this.saveForm = {
                id: null,
                name: '',
                tel: '',
                registerTime: null,
                state: 0,
                address: '',
                logo: '',
                adminId: null,
                employee: null
            };
            // 获取经理集合
            this.getManagers();
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
                        // 将经理id赋值为经理id（不赋则为对象）
                        paras.adminId = this.saveForm.adminId.id;
                        paras.employee = null;
                        this.$http.put("/shop", paras).then(res => {
                            this.saveFormVisible = false;
                            this.saveLoading = false;
                            if (res.data.success) {
                                this.$message.success(this.title + "成功");
                                this.getShops();
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
                this.$http.patch("/shop", ids).
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
                            this.getShops();
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
        this.getShops();
    }
}
</script>
<style scoped>
</style>