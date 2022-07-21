<template>
    <section>
        <!--工具条：关键字查询 + 新增-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true">
                <el-form-item>
                    <el-input v-model="keyword" placeholder="请输入关键字"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="keywordQuery">关键字查询</el-button>
                </el-form-item>
                <el-form-item>
                    <!--  v-perm="'role:add'" -->
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--列表:优秀实践，copy domain修改列表-->
        <el-table :data="roles" highlight-current-row v-loading="listLoading"
                  @selection-change="selsChange" style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" width="60">
            </el-table-column>
            <el-table-column prop="name" label="名称" width="220" sortable>
            </el-table-column>
            <el-table-column prop="sn" label="编码" width="180" sortable>
            </el-table-column>
            <el-table-column label="操作">
                <template scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <!-- v-perm="'role:delete'" -->
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange"
                           :current-page="currentPage" :page-size="pageSize" :total="totals" style="float:right;">
            </el-pagination>
        </el-col>

        <!--新增和编辑对话框-->
        <el-dialog :title="title" :visible.sync="saveFormVisible" :close-on-click-modal="false">
            <!--ref="saveForm" 指定表单名称，以后可以通过this.$refs.roleForm-->
            <el-form :model="saveForm" label-width="80px" :rules="saveFormRules" ref="saveForm">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="saveForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="角色编码" prop="sn">
                    <el-input v-model="saveForm.sn" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="分配菜单" prop="menus">
                    <el-cascader v-model="saveForm.menus" clearable
                                 placeholder="试试搜索：指南"
                                 :options="menuTree"
                                 :props="{
									multiple: true,
								 	label:'name',
									value:'id'
								 }"
                                 filterable></el-cascader>
                </el-form-item>
                <el-form-item label="分配权限" prop="permissions">
                    <el-select v-model="saveForm.permissions" multiple placeholder="请选择">
                        <el-option
                            v-for="item in permissionList"
                            :label="item.name"
                            :value="item.id">
                            <span style="float: left">{{ item.name }}</span>
                            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.sn }}</span>
                        </el-option>
                    </el-select>
                </el-form-item>

            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="saveFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="saveSubmit" :loading="saveLoading">保存</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script>
export default {
    data() {
        return {
            //分页显示所属数据
            roles: [],
            listLoading: false,
            currentPage: 1,
            pageSize: 10,
            totals: 0,

            //高级查询所需数据
            keyword: null,

            //多条数据选中
            sels: [],//列表选中列

            //添加或修改数据
            saveFormVisible: false,//添加或修改界面是否显示
            saveLoading: false,
            title: null,
            saveFormRules: {
                name: [
                    {required: true, message: '请输入名称', trigger: 'blur'}
                ],
                sn: [
                    {required: true, message: '请输角色编码', trigger: 'blur'}
                ],
                menus: [
                    {required: true, message: '请分配菜单', trigger: 'blur'}
                ],
                permissions: [
                    {required: true, message: '请分配权限', trigger: 'blur'}
                ],
            },
            //编辑界面数据
            saveForm: {
                id: null,
                name: '',
                sn: '',
                menus: null,
                permissions: null
            },

            menuTree: [],
            permissionList: []
        }
    },
    methods: {
        //获取员工列表
        getRoles() {
            let paras = {
                currentPage: this.currentPage,
                pageSize: this.pageSize,
                keyword: this.keyword
            };
            this.listLoading = true;
            this.$http.post("/role", paras).then(res => {
                this.totals = res.data.totals;
                this.roles = res.data.data;
                this.listLoading = false;
            }).catch(res => {
                this.$message.error("获取分页数据失败!!!");
            })
        },

        //关键字查询
        keywordQuery() {
            this.currentPage = 1;
            this.getRoles();
        },

        //分页查询 - 点击某一页查询
        handleCurrentChange(val) {
            this.currentPage = val;
            this.getRoles();
        },

        //删除
        handleDel: function (index, row) {
            this.$confirm('确认删除该记录吗?', '提示', {
                type: 'warning'
            }).then(() => {
                this.listLoading = true;
                this.$http.delete("/role/" + row.id).then(res => {
                    this.listLoading = false;
                    if (res.data.success) {
                        //计算总页数
                        let totalPage = this.totals % this.pageSize == 0 ? this.totals / this.pageSize
                            : Math.ceil(this.totals / this.pageSize);
                        if (this.currentPage > 1 && this.currentPage == totalPage && (this.totals - 1) % this.pageSize == 0) {
                            this.currentPage = this.currentPage - 1;
                        }
                        this.getRoles();
                    } else {
                        this.$message.error("删除失败【500】");
                    }
                }).catch(res => {
                    this.$message.error("系统错误【400,404】");
                })
            }).catch(() => {
                //确认框点击取消之后走这里
            });
        },

        //点击修改按钮弹出模态框
        handleEdit: function (index, row) {
            //修改对话框标题
            this.title = "编辑";
            //回显
            this.saveForm = Object.assign({}, row);

            this.getMenuTree();//加载菜单树
            this.getPermissionList();//加载权限下拉列表

            if (row.ownMenus) {//需要回显，这里要处已经拥有的权限的格式
                let menus = [];
                for (let i = 0; i < row.ownMenus.length; i++) {
                    let menu = row.ownMenus[i];
                    let menuTmp = [];
                    if (menu.parent_id != null && menu.parent_id != "") {
                        menuTmp.push(menu.parent_id);
                    }
                    menuTmp.push(menu.id);
                    menus.push(menuTmp);
                }
                this.saveForm.menus = menus;
            }
            //弹出对话框
            this.saveFormVisible = true;
        },

        //点击添加按钮弹出对话框
        handleAdd: function () {
            //修改对话框标题
            this.title = "添加";
            this.getMenuTree();//加载菜单树
            this.getPermissionList();//加载权限下拉列表
            //置空数据，防止先点修改，后点添加有值
            this.saveForm = {
                id: null,
                name: '',
                sn: '',
                menus: null,
                permissions: null
            };
            //显示对话框
            this.saveFormVisible = true;
        },

        //点击对话框提交数据
        saveSubmit: function () {
            this.$refs.saveForm.validate((valid) => {
                if (valid) {
                    this.$confirm('确认保存吗？', '提示', {}).then(() => {
                        this.saveLoading = true;
                        let para = Object.assign({}, this.saveForm);
                        //处理分配菜单参数格式 menus:[[22,23],[22,24],[22,25]]---->menus:[23,24,25]
                        let menusArr = para.menus;
                        if (menusArr) {
                            let menusTmp = [];
                            for (var i = 0; i < menusArr.length; i++) {
                                let menuTmp = menusArr[i];
                                menusTmp.push(menuTmp[menuTmp.length - 1]);
                            }
                            para.menus = menusTmp;
                        }
                        this.$http.put("/role", para).then((res) => {
                            this.saveFormVisible = false;
                            this.saveLoading = false;
                            if (res.data.success) {
                                this.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                this.$refs['saveForm'].resetFields();//重置表单
                                this.getRoles(); //重新加载
                            } else {
                                this.$message.error("操作失败【500】");
                            }
                        }).catch(res => {
                            this.$message.error("系统错误【400,404】");
                        })
                    });
                }
            });
        },

        selsChange: function (sels) {
            this.sels = sels;
        },

        //批量删除
        batchRemove: function () {
            //遍历选择记录把id放到一个数组中
            var ids = this.sels.map(item => item.id); //[1,2,3]
            this.$confirm('确认删除选中记录吗？', '温馨提示', {
                type: 'warning'
            }).then(() => {
                this.listLoading = true;
                this.$http.patch("/role", ids).then((res) => {
                    this.listLoading = false;
                    if (res.data.success) {
                        this.$message.success("操作成功");
                        this.currentPage = 1;
                        this.getRoles();
                    } else {
                        this.$message.error("批量删除失败【500】");
                    }
                }).catch(res => {
                    this.$message.error("系统错误【400,404】");
                })
            }).catch(() => {
            });
        },

        getMenuTree() {
            this.$http.get("/menu/tree").then(res => {
                if (res.data) {
                    this.menuTree = res.data;
                }
            });
        },

        getPermissionList() {
            this.$http.get("/permission").then(res => {
                if (res.data) {
                    this.permissionList = res.data;
                }
            });
        }
    },
    mounted() {
        this.getRoles();
    }
}

</script>

<style scoped>

</style>