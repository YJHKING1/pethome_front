<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true">
                <el-form-item>
                    <el-input v-model="keyword" placeholder="编号或姓名关键字" v-perm="'department:get'"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="keywordQuery" v-perm="'department:get'">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd" v-perm="'department:save'">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--列表-->
        <el-table :data="departments" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
                  style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" label="序号" width="60">
            </el-table-column>
            <el-table-column prop="id" label="id" width="60" sortable>
            </el-table-column>
            <el-table-column prop="sn" label="编号" width="150" sortable>
            </el-table-column>
            <el-table-column prop="name" label="部门" width="150" sortable>
            </el-table-column>
            <el-table-column prop="dirPath" label="路径" width="200" sortable>
            </el-table-column>
            <el-table-column prop="state" label="状态" width="100" sortable>
                <template scope="scope">
                    <span v-if="scope.row.state==1" style="color: green">正常</span>
                    <span v-else style="color: red">停用</span>
                </template>
            </el-table-column>
            <el-table-column prop="manager.username" label="经理" width="100" sortable>
            </el-table-column>
            <el-table-column prop="parent.name" label="上级部门" width="100" sortable>
            </el-table-column>
            <el-table-column label="操作">
                <template scope="scope">
                    <el-button type="success" size="small" @click="handleEdit(scope.$index, scope.row)"
                               v-perm="'department:save'">编辑
                    </el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)"
                               v-perm="'department:delete'">删除
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
        <el-dialog title="编辑" :visible.sync="editFormVisible" :close-on-click-modal="false">
            <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
                <el-form-item prop="sn" label="编号">
                    <el-input v-model="editForm.sn"></el-input>
                </el-form-item>
                <el-form-item prop="name" label="部门名">
                    <el-input v-model="editForm.name"></el-input>
                </el-form-item>
                <el-form-item label="启用状态">
                    <el-radio-group v-model="editForm.state">
                        <el-radio class="radio" :label="1">正常</el-radio>
                        <el-radio class="radio" :label="0">停用</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item prop="managerId" label="经理">
                    <el-select v-model="editForm.managerId" value-key="id" placeholder="请选择经理" clearable>
                        <el-option v-for="item in managers" :label="item.username" :value="item">
                            <span style="float: left">{{ item.username }}</span>
                            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.phone }}</span>
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item prop="parentId" label="上级部门">
                    <el-cascader v-model="editForm.parent"
                                 :options="deptTree"
                                 :props="{
                                     checkStrictly: true,
                                     label: 'name',
                                     value: 'id'
                                 }" clearable>
                    </el-cascader>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="editFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>

        <!--新增界面-->
        <el-dialog title="新增" :visible.sync="addFormVisible" :close-on-click-modal="false">
            <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
                <el-form-item prop="sn" label="编号">
                    <el-input v-model="addForm.sn"></el-input>
                </el-form-item>
                <el-form-item prop="name" label="部门名">
                    <el-input v-model="addForm.name"></el-input>
                </el-form-item>
                <el-form-item label="启用状态">
                    <el-radio-group v-model="addForm.state">
                        <el-radio class="radio" :label="1">正常</el-radio>
                        <el-radio class="radio" :label="0">停用</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item prop="managerId" label="经理">
                    <el-select v-model="addForm.managerId" value-key="id" placeholder="请选择经理" clearable>
                        <el-option v-for="item in managers" :label="item.username" :value="item">
                            <span style="float: left">{{ item.username }}</span>
                            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.phone }}</span>
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item prop="parentId" label="上级部门">
                    <el-cascader v-model="addForm.parent"
                                 :options="deptTree"
                                 :props="{
                                     checkStrictly: true,
                                     label: 'name',
                                     value: 'id'
                                 }" clearable>
                    </el-cascader>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="addFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
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
            departments: [],
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
            // 关键字
            keyword: '',
            // 经理
            managers: [],
            // 部门树
            deptTree: [],
            editFormVisible: false,//编辑界面是否显示
            editLoading: false,
            editFormRules: {
                name: [
                    {required: true, message: '请输入部门名', trigger: 'blur'}
                ],
                sn: [
                    {required: true, message: '请输入编号', trigger: 'blur'}
                ]
            },
            //编辑界面数据
            editForm: {
                id: null,
                sn: '',
                name: '',
                dirPath: null,
                state: 0,
                managerId: null,
                manager: null,
                parentId: null,
                parent: null,
            },

            addFormVisible: false,//新增界面是否显示
            addLoading: false,
            addFormRules: {
                name: [
                    {required: true, message: '请输入部门名', trigger: 'blur'}
                ],
                sn: [
                    {required: true, message: '请输入编号', trigger: 'blur'}
                ]
            },
            //新增界面数据
            addForm: {
                id: null,
                sn: '',
                name: '',
                dirPath: null,
                state: 0,
                managerId: null,
                manager: null,
                parentId: null,
                parent: null,
            }
        }
    },
    methods: {
        //性别显示转换
        formatSex: function (row, column) {
            return row.sex == 1 ? '男' : row.sex == 0 ? '女' : '未知';
        },
        // 点击页码
        handleCurrentChange(val) {
            this.currentPage = val;
            this.getDepartments();
        },
        // 关键字查询
        keywordQuery() {
            this.currentPage = 1;
            this.getDepartments();
        },
        // 经理集合
        getManagers() {
            this.$http.get("/employee").then(res => {
                this.managers = res.data;
            });
        },
        // 部门树
        getDeptTree() {
            this.$http.get("/department/deptTree").then(res => {
                this.deptTree = res.data;
            });
        },
        //获取部门列表
        getDepartments() {
            let para = {
                "currentPage": this.currentPage,
                "pageSize": this.pageSize,
                "keyword": this.keyword
            };
            // 显示盲等框
            this.listLoading = true;
            this.$http.post("/department", para).then(res => {
                // 赋值总数
                this.totals = res.data.totals;
                // 赋值分页
                this.departments = res.data.data;
                // 关闭盲等框
                this.listLoading = false;
            }).catch(res => {
                this.$message.error("网络繁忙，请稍后再试");
            });
            //NProgress.start();
            /*getDepartmentListPage(para).then((res) => {
              this.total = res.data.total;
              this.departments = res.data.departments;
              this.listLoading = false;
              //NProgress.done();
            });*/
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
                this.$http.delete("/department/" + row.id).
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
                            this.getDepartments();
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
            // 备份数据
            this.editForm = Object.assign({}, row);
            // 获取经理集合
            this.getManagers();
            // 获取部门树
            this.getDeptTree();
            let dirPath = row.dirPath;
            let dirArr = dirPath.split("/");
            var arr = [];
            for (let i = 1; i < dirArr.length - 1; i++) {
                arr[i - 1] = parseInt(dirArr[i]);
            }
            this.editForm.parent = arr;
            // 显示修改对话框
            this.editFormVisible = true;
        },
        //显示新增界面
        handleAdd: function () {
            // 赋空值
            this.addForm = {
                id: null,
                sn: '',
                name: '',
                dirPath: null,
                state: 0,
                managerId: null,
                manager: null,
                parentId: null,
                parent: null,
            };
            // 获取经理集合
            this.getManagers();
            // 获取部门树
            this.getDeptTree();
            // 显示修改对话框
            this.addFormVisible = true;
        },
        //编辑
        editSubmit: function () {
            this.$refs.editForm.validate((valid) => {
                if (valid) {
                    this.$confirm('确认提交吗？', '提示', {}).then(() => {
                        this.editLoading = true;
                        // 此为表单中的数据
                        let paras = Object.assign({}, this.editForm);
                        // 将经理id赋值为经理id（不赋则为对象）
                        paras.managerId = this.editForm.managerId.id;
                        var arr = this.editForm.parent;
                        if (arr) {
                            paras.parentId = arr[arr.length - 1];
                        }
                        paras.manager = null;
                        paras.parent = null;
                        this.$http.put("/department/" + paras.id, paras).then(res => {
                            this.editFormVisible = false;
                            this.editLoading = false;
                            if (res.data.success) {
                                this.$message.success("修改成功");
                                this.getDepartments();
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
        //新增
        addSubmit: function () {
            this.$refs.addForm.validate((valid) => {
                if (valid) {
                    this.$confirm('确认提交吗？', '提示', {}).then(() => {
                        this.addLoading = true;
                        let paras = Object.assign({}, this.addForm);
                        // 将经理id赋值为经理id（不赋则为对象）
                        paras.managerId = this.addForm.managerId.id;
                        var arr = this.addForm.parent;
                        if (arr) {
                            paras.parentId = arr[arr.length - 1];
                        }
                        paras.manager = null;
                        paras.parent = null;
                        this.$http.put("/department", paras).then(res => {
                            this.addFormVisible = false;
                            this.addLoading = false;
                            if (res.data.success) {
                                this.$message.success("新增成功");
                                this.getDepartments();
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
                this.$http.patch("/department", ids).
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
                            this.getDepartments();
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
        this.getDepartments();
    }
}
</script>
<style scoped>
</style>