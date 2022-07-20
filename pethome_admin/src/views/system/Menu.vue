<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true">
                <el-form-item>
                    <el-input v-model="keyword" placeholder="名称"></el-input>
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
        <el-table :data="menu" highlight-current-row v-loading="listLoading"
                  @selection-change="selsChange"
                  style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" label="序号" width="60">
            </el-table-column>
            <el-table-column prop="name" label="名称" width="150" sortable>
            </el-table-column>
            <el-table-column prop="component" label="组件路径" width="300" sortable>
            </el-table-column>
            <el-table-column prop="url" label="访问地址" width="180" sortable>
            </el-table-column>
            <el-table-column prop="icon" label="图标" width="100" sortable>
            </el-table-column>
            <el-table-column prop="index" label="索引" width="100" sortable>
            </el-table-column>
            <el-table-column prop="parent.name" label="父级菜单" width="150" sortable>
            </el-table-column>
            <el-table-column prop="intro" label="简介" width="100" sortable>
            </el-table-column>
            <el-table-column prop="state" label="状态" width="100" sortable>
                <template scope="scope">
                    <span v-if="scope.row.state" style="color: green">正常</span>
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
                <el-form-item prop="name" label="名称">
                    <el-input v-model="saveForm.name"></el-input>
                </el-form-item>
                <el-form-item prop="url" label="访问地址">
                    <el-input v-model="saveForm.url"></el-input>
                </el-form-item>
                <el-form-item prop="component" label="组件路径">
                    <el-input v-model="saveForm.component"></el-input>
                </el-form-item>
                <el-form-item prop="intro" label="标识">
                    <el-input v-model="saveForm.intro"></el-input>
                </el-form-item>
                <el-form-item prop="icon" label="图标">
                    <el-input v-model="saveForm.icon"></el-input>
                </el-form-item>
                <el-form-item prop="index" label="排序索引">
                    <el-input-number v-model="saveForm.index"></el-input-number>
                </el-form-item>
                <el-form-item prop="parent" label="上级菜单">
                    <el-cascader v-model="saveForm.parent"
                                 :options="menuTree"
                                 :props="{
                                     checkStrictly: true,
                                     label: 'name',
                                     value: 'id'
                                 }" clearable>
                    </el-cascader>
                </el-form-item>
                <el-form-item label="状态">
                    <el-radio-group v-model="saveForm.state">
                        <el-radio class="radio" :label="true">正常</el-radio>
                        <el-radio class="radio" :label="false">停用</el-radio>
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
            data: [],
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
            // 关键字
            keyword: '',
            // 菜单分页数据
            menu: [],
            // 编辑界面是否显示
            saveFormVisible: false,
            saveLoading: false,
            // 菜单树
            menuTree: [],
            // 新增编辑数据验证
            saveFormRules: {
                name: [
                    {required: true, message: '请输入名称', trigger: 'blur'}
                ],
                index: [
                    {required: true, message: '请输入排序索引', trigger: 'blur'}
                ],
                url: [
                    {required: true, message: '请输入访问地址', trigger: 'blur'}
                ],
                component: [
                    {required: true, message: '请输入组件路径', trigger: 'blur'}
                ]
            },
            //编辑界面数据
            saveForm: {
                id: null,
                name: '',
                component: '',
                url: '',
                icon: '',
                index: '',
                parentId: null,
                intro: '',
                state: false,
                parent: null
            }
        }
    },
    methods: {
        // 点击页码
        handleCurrentChange(val) {
            this.currentPage = val;
            this.getMenu();
        },
        // 关键字查询
        keywordQuery() {
            this.currentPage = 1;
            this.getMenu();
        },
        // 获取菜单数据
        getData() {
            this.$http.get("/menu").then(res => {
                this.data = res.data;
            });
        },
        // 获取菜单树
        getMenuTree() {
            this.$http.get("/menu/tree").then(res => {
                this.menuTree = res.data;
            });
        },
        // 获取菜单数据
        getMenu() {
            let para = {
                "currentPage": this.currentPage,
                "pageSize": this.pageSize,
                "keyword": this.keyword
            };
            // 显示盲等框
            this.listLoading = true;
            this.$http.post("/menu", para).then(res => {
                // 赋值总数
                this.totals = res.data.totals;
                // 赋值分页
                this.menu = res.data.data;
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
                this.$http.delete("/menu/" + row.id).
                    // 请求成功
                    then(res => {
                        // 关闭等待圈
                        this.listLoading = false;
                        // 返回信息：成功
                        if (res.data.success) {
                            // 总页数
                            let totalPage = Math.ceil(this.totals / this.pageSize);
                            // 如果当前页为最后一页且当前条数为最后一条且当前页不为第一页
                            if (this.currentPage == totalPage && (this.totals - 1) % this.pageSize == 0
                                && this.currentPage != 1) {
                                this.currentPage = this.currentPage - 1;
                            }
                            // 显示信息
                            this.$message.success("删除成功");
                            // 再次查询
                            this.getMenu();
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
            this.getData();
            // 获取菜单树
            this.getMenuTree();
            // 将改行的父级id赋值给parent
            this.saveForm.parent = row.parentId;
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
                component: '',
                url: '',
                icon: '',
                index: '',
                parentId: null,
                intro: '',
                state: false,
                parent: null
            };
            this.getData();
            // 获取菜单树
            this.getMenuTree();
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
                        let arr = paras.parent;
                        // 将parentId赋值为parent.id
                        if (arr != null) {
                            paras.parentId = arr[arr.length - 1];
                        } else {
                            paras.parentId = null;
                        }
                        // 将parent设为空
                        paras.parent = null;
                        this.$http.put("/menu", paras).then(res => {
                            this.saveFormVisible = false;
                            this.saveLoading = false;
                            if (res.data.success) {
                                this.$message.success(this.title + "成功");
                                this.getMenu();
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
                this.$http.patch("/menu", ids).
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
                            this.getMenu();
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
        this.getMenu();
    }
}
</script>
<style scoped>
</style>