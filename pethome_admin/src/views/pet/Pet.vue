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
        <el-table :data="tableData" highlight-current-row v-loading="listLoading"
                  @selection-change="selsChange"
                  style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" label="序号" width="60">
            </el-table-column>
            <el-table-column prop="name" label="宠物名" width="100" sortable>
            </el-table-column>
            <el-table-column prop="costprice" label="成本" width="100" sortable>
            </el-table-column>
            <el-table-column prop="saleprice" label="售价" width="100" sortable>
            </el-table-column>
            <el-table-column prop="petType.name" label="类型" width="100" sortable>
            </el-table-column>
            <el-table-column prop="resources" label="宠物图片" width="100" sortable>
                <template scope="scope">
                    <img :src="imgPrefix+scope.row.resources" width="50px" alt="">
                </template>
            </el-table-column>
            <el-table-column prop="state" label="状态" width="100" sortable>
                <template scope="scope">
                    <span v-if="scope.row.state" style="color: green">正常</span>
                    <span v-else style="color: red">停用</span>
                </template>
            </el-table-column>
            <el-table-column prop="offsaletime" label="销售时间" width="100" sortable>
            </el-table-column>
            <el-table-column prop="onsaletime" label="发售时间" width="100" sortable>
            </el-table-column>
            <el-table-column prop="createtime" label="创建时间" width="100" sortable>
            </el-table-column>
            <el-table-column prop="shop.name" label="店铺" width="100" sortable>
            </el-table-column>
            <el-table-column prop="user.username" label="用户" width="100" sortable>
            </el-table-column>
            <el-table-column prop="searchMasterMsg.name" label="寻主" width="100" sortable>
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
                <el-form-item prop="name" label="宠物名">
                    <el-input v-model="saveForm.name"></el-input>
                </el-form-item>
                <el-form-item prop="costprice" label="成本">
                    <el-input v-model="saveForm.costprice"></el-input>
                </el-form-item>
                <el-form-item prop="saleprice" label="售价">
                    <el-input v-model="saveForm.saleprice"></el-input>
                </el-form-item>
                <el-form-item prop="typeId" label="类型">
                    <el-cascader v-model="saveForm.typeId"
                                 :options="typeTree"
                                 :props="{
                                     checkStrictly: true,
                                     label: 'name',
                                     value: 'id'
                                 }" clearable>
                    </el-cascader>
                </el-form-item>
                <el-form-item prop="resources" label="宠物图片">
                    <el-upload class="upload-demo"
                               action="http://localhost:8080/fastDfs/"
                               :on-preview="handlePreview"
                               :on-remove="handleRemove"
                               :on-success="handleSuccess"
                               :file-list="fileList"
                               list-type="picture">
                        <el-button size="small" type="primary">点击上传</el-button>
                    </el-upload>
                </el-form-item>
                <el-form-item label="状态">
                    <el-radio-group v-model="saveForm.state">
                        <el-radio class="radio" :label="1">正常</el-radio>
                        <el-radio class="radio" :label="0">停用</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item prop="shop" label="店铺">
                    <el-select v-model="saveForm.shop" value-key="id" placeholder="请选择店铺" clearable>
                        <el-option v-for="item in shops" :label="item.name" :value="item">
                            <span style="float: left">{{ item.name }}</span>
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item prop="user" label="用户">
                    <el-select v-model="saveForm.user" value-key="id" placeholder="请选择用户" clearable>
                        <el-option v-for="item in users" :label="item.username" :value="item">
                            <span style="float: left">{{ item.username }}</span>
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item prop="searchMasterMsg" label="寻主">
                    <el-select v-model="saveForm.searchMasterMsg" value-key="id" placeholder="请选择寻主" clearable>
                        <el-option v-for="item in searchMasterMsgs" :label="item.name" :value="item">
                            <span style="float: left">{{ item.name }}</span>
                        </el-option>
                    </el-select>
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
            //文件上传相关数据
            fileList: [],
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
            // 列表展示分页数据
            tableData: [],
            // 编辑界面是否显示
            saveFormVisible: false,
            saveLoading: false,
            // 菜单树
            typeTree: [],
            shops: [],
            users: [],
            searchMasterMsgs: [],
            // 图片前缀
            imgPrefix: 'http://123.207.27.208',
            // 新增编辑数据验证
            saveFormRules: {
                /*name: [
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
                ]*/
            },
            //编辑界面数据
            saveForm: {
                id: null,
                name: '',
                costprice: '',
                saleprice: '',
                typeId: null,
                petType: null,
                resources: '',
                state: 0,
                offsaletime: '',
                onsaletime: '',
                createtime: '',
                shopId: null,
                shop: null,
                userId: null,
                user: null,
                searchMasterMsgId: null,
                searchMasterMsg: null
            }
        }
    },
    methods: {
        // 点击页码
        handleCurrentChange(val) {
            this.currentPage = val;
            this.getTableData();
        },
        // 关键字查询
        keywordQuery() {
            this.currentPage = 1;
            this.getTableData();
        },
        // 获取菜单数据
        getData() {
            this.$http.get("/pet").then(res => {
                this.data = res.data;
            });
        },
        //图片预览
        handlePreview(file) {
            console.log(file);
        },
        // 文件上传的业务逻辑
        handleSuccess(response, file, fileList) {
            this.saveForm.resources = response.resultObj;
        },
        // 文件删除的业务逻辑
        handleRemove(file, fileList) {
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
        getShops() {
            this.$http.get("/shop").then(res => {
                this.shops = res.data;
            });
        },
        getUsers() {
            this.$http.get("/user").then(res => {
                this.users = res.data;
            });
        },
        getSearchMasterMsgs() {
            this.$http.get("/searchMasterMsg").then(res => {
                this.searchMasterMsgs = res.data;
            });
        },
        // 获取菜单树
        getTypeTree() {
            this.$http.get("/pet/typeTree").then(res => {
                this.typeTree = res.data;
            });
        },
        // 获取列表数据
        getTableData() {
            let para = {
                "currentPage": this.currentPage,
                "pageSize": this.pageSize,
                "keyword": this.keyword
            };
            // 显示盲等框
            this.listLoading = true;
            this.$http.post("/pet", para).then(res => {
                // 赋值总数
                this.totals = res.data.totals;
                // 赋值分页
                this.tableData = res.data.data;
                // 关闭盲等框
                this.listLoading = false;
            }).catch(res => {
                this.$message.error("网络繁忙，请稍后再试");
            });
        },
        echo() {
            if (this.saveForm.user) {
                this.saveForm.user = this.saveForm.user.username;
            }
            if (this.saveForm.shop) {
                this.saveForm.shop = this.saveForm.shop.name;
            }
            if (this.saveForm.searchMasterMsg) {
                this.saveForm.searchMasterMsg = this.saveForm.searchMasterMsg.name;
            }
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
                this.$http.delete("/pet/" + row.id).
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
                            this.getTableData();
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
            this.getShops();
            this.getUsers();
            this.getSearchMasterMsgs();
            // 获取菜单树
            this.getTypeTree();
            // 将改行的父级id赋值给parent
            this.saveForm.parent = row.parentId;
            // 回显
            this.echo();
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
                costprice: '',
                saleprice: '',
                typeId: null,
                petType: null,
                resources: '',
                state: 0,
                offsaletime: '',
                onsaletime: '',
                createtime: '',
                shopId: null,
                shop: null,
                userId: null,
                user: null,
                searchMasterMsgId: null,
                searchMasterMsg: null
            };
            this.getData();
            this.getShops();
            this.getUsers();
            this.getSearchMasterMsgs();
            // 获取菜单树
            this.getTypeTree();
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
                        let arr = paras.typeId;
                        if (arr != null) {
                            paras.typeId = arr[arr.length - 1];
                        } else {
                            paras.typeId = null;
                        }
                        paras.shopId = paras.shop.id;
                        paras.userId = paras.user.id;
                        paras.searchMasterMsgId = paras.searchMasterMsg.id;
                        paras.shop = null;
                        paras.user = null;
                        paras.searchMasterMsg = null;
                        this.$http.put("/pet", paras).then(res => {
                            this.saveFormVisible = false;
                            this.saveLoading = false;
                            if (res.data.success) {
                                this.$message.success(this.title + "成功");
                                this.getTableData();
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
                this.$http.patch("/pet", ids).
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
                            this.getTableData();
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
        this.getTableData();
    }
}
</script>
<style scoped>
</style>