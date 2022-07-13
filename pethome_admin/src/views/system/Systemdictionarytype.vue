<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true">
                <el-form-item>
                    <el-input v-model="keyword" placeholder="编号、名称、id"></el-input>
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
        <el-table :data="systemdictionarytypes" highlight-current-row v-loading="listLoading"
                  @selection-change="selsChange"
                  style="width: 100%;" @row-dblclick="openTable">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" label="序号" width="60">
            </el-table-column>
            <el-table-column prop="id" label="id" width="60" sortable>
            </el-table-column>
            <el-table-column prop="sn" label="字典编号" width="150" sortable>
            </el-table-column>
            <el-table-column prop="name" label="名称" width="100" sortable>
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
                <el-form-item prop="sn" label="字典编号">
                    <el-input v-model="saveForm.sn"></el-input>
                </el-form-item>
                <el-form-item prop="name" label="名称">
                    <el-input v-model="saveForm.name"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="saveFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="saveSubmit" :loading="saveLoading">提交</el-button>
            </div>
        </el-dialog>
        <!--抽屉-->
        <el-drawer
            title="分类"
            :visible.sync="table"
            direction="rtl"
            size="30%">
            <el-table :data="systemdictionarydetails" highlight-current-row v-loading="listLoading"
                      @selection-change="selsChange"
                      style="width: 100%;">
                <el-table-column type="index" label="序号" width="100">
                </el-table-column>
                <el-table-column prop="id" label="id" width="100" sortable>
                </el-table-column>
                <el-table-column prop="name" label="名称" width="100" sortable>
                </el-table-column>
            </el-table>
        </el-drawer>
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
            systemdictionarytypes: [],
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
            // 员工列表
            systemdictionarydetails: [],
            // 抽屉显示
            table: false,
            title: "",
            // 关键字
            keyword: '',
            // 编辑界面是否显示
            saveFormVisible: false,
            saveLoading: false,
            saveFormRules: {
                sn: [
                    {required: true, message: '请输入分类', trigger: 'blur'}
                ],
                name: [
                    {required: true, message: '请输入名称', trigger: 'blur'}
                ]
            },
            //编辑界面数据
            saveForm: {
                id: null,
                sn: '',
                name: ''
            }
        }
    },
    methods: {
        // 点击页码
        handleCurrentChange(val) {
            this.currentPage = val;
            this.getSystemdictionarytypes();
        },
        // 关键字查询
        keywordQuery() {
            this.currentPage = 1;
            this.getSystemdictionarytypes();
        },
        // 打开抽屉
        openTable(row) {
            // 获取员工表
            this.getSystemdictionarydetails(row);
            // 打开抽屉
            this.table = true;
        },
        // 获取员工列表
        getSystemdictionarydetails(row) {
            let para = {
                "currentPage": this.currentPage,
                "pageSize": this.pageSize,
                "keyword": this.keyword
            };
            para.keyword = row.id;
            // 显示盲等框
            this.listLoading = true;
            this.$http.post("/systemdictionarydetail", para).then(res => {
                // 赋值总数
                this.totals = res.data.totals;
                // 赋值分页
                this.systemdictionarydetails = res.data.data;
                // 关闭盲等框
                this.listLoading = false;
            }).catch(res => {
                this.$message.error("网络繁忙，请稍后再试");
            });
        },
        // 获取店铺列表
        getSystemdictionarytypes() {
            let para = {
                "currentPage": this.currentPage,
                "pageSize": this.pageSize,
                "keyword": this.keyword
            };
            // 显示盲等框
            this.listLoading = true;
            this.$http.post("/systemdictionarytype", para).then(res => {
                // 赋值总数
                this.totals = res.data.totals;
                // 赋值分页
                this.systemdictionarytypes = res.data.data;
                // 关闭盲等框
                this.listLoading = false;
            }).catch(res => {
                this.$message.error("网络繁忙，请稍后再试");
            });
        },
        // 删除点击事件
        handleDel: function (index, row) {
            // 弹出确认框
            this.$confirm('删除数据字典类型会同时删除数据字典明细，你确定要删除吗?', '提示', {
                // 确认框类型
                type: 'warning'
                // 确定事件
            }).then(() => {
                // 显示等待圈
                this.listLoading = true;
                // 发送异步请求
                this.$http.delete("/systemdictionarytype/" + row.id).
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
                            this.getSystemdictionarytypes();
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
            // 显示修改对话框
            this.saveFormVisible = true;
        },
        //显示新增界面
        handleAdd: function () {
            this.title = "新增";
            // 赋空值
            this.saveForm = {
                id: null,
                sn: '',
                name: ''
            };
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
                        this.$http.put("/systemdictionarytype", paras).then(res => {
                            this.saveFormVisible = false;
                            this.saveLoading = false;
                            if (res.data.success) {
                                this.$message.success(this.title + "成功");
                                this.getSystemdictionarytypes();
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
                this.$http.patch("/systemdictionarytype", ids).
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
                            this.getSystemdictionarytypes();
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
        this.getSystemdictionarytypes();
    }
}
</script>
<style scoped>
</style>