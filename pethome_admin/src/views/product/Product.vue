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
                  style="width: 100%;" @cell-click="maxImg">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" label="序号" width="60">
            </el-table-column>
            <el-table-column prop="name" label="名称" width="100" sortable>
            </el-table-column>
            <el-table-column prop="costprice" label="成本" width="100" sortable>
            </el-table-column>
            <el-table-column prop="saleprice" label="售价" width="100" sortable>
            </el-table-column>
            <el-table-column prop="resources" label="图片" width="100" sortable>
                <template scope="scope">
                    <!--如果仅有一张图片时直接展示-->
                    <el-image :src="imgPrefix+scope.row.resources" width="50px" alt=""
                              v-if="!scope.row.resources.includes(',')" :preview-src-list="srcList" fit="contain"/>
                    <!--如果有多张图片时展示第一张-->
                    <el-image :src="imgPrefix+scope.row.resources.split(',')[0]" width="50px" alt=""
                              v-else-if="scope.row.resources.includes(',')" :preview-src-list="srcList" fit="contain"/>
                </template>
            </el-table-column>
            <el-table-column prop="salecount" label="销量" width="100" sortable>
            </el-table-column>
            <el-table-column prop="state" label="状态" width="100" sortable>
                <template scope="scope">
                    <span v-if="scope.row.state" style="color: green">上架</span>
                    <span v-else style="color: red">下架</span>
                </template>
            </el-table-column>
            <el-table-column prop="offsaletime" label="下架时间" width="100" sortable>
            </el-table-column>
            <el-table-column prop="onsaletime" label="上架时间" width="100" sortable>
            </el-table-column>
            <el-table-column prop="createtime" label="创建时间" width="100" sortable>
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
            <el-button type="primary" size="small" @click="onsale" :disabled="this.sels.length===0">上架</el-button>
            <el-button type="primary" size="small" @click="offsale" :disabled="this.sels.length===0">下架</el-button>
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :current-page="currentPage"
                           :page-size="pageSize" :total="totals" style="float:right;">
            </el-pagination>
        </el-col>
        <!--编辑界面-->
        <el-dialog :title="title" :visible.sync="saveFormVisible" :close-on-click-modal="false" width="80%">
            <el-form :model="saveForm" label-width="80px" :rules="saveFormRules" ref="saveForm">
                <el-form-item prop="name" label="名称">
                    <el-input v-model="saveForm.name"></el-input>
                </el-form-item>
                <el-form-item prop="costprice" label="成本">
                    <el-input-number v-model="saveForm.costprice"></el-input-number>
                </el-form-item>
                <el-form-item prop="saleprice" label="售价">
                    <el-input-number v-model="saveForm.saleprice"></el-input-number>
                </el-form-item>
                <el-form-item label="宠物图片" prop="resources">
                    <el-upload class="upload-demo"
                               action="http://localhost:8080/fastDfs"
                               :on-remove="handleRemove"
                               :on-success="handleSuccess"
                               :file-list="fileList"
                               list-type="picture">
                        <el-button size="small" type="primary">点击上传</el-button>
                        <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                    </el-upload>
                </el-form-item>
                <el-form-item prop="salecount" label="销量">
                    <el-input-number v-model="saveForm.saleprice"></el-input-number>
                </el-form-item>
                <el-form-item label="简介" prop="intro">
                    <!-- v-if="saveForm.petDetail" 修改v-model绑定对象报错问题，v-if对需要显示的数据判断下 -->
                    <quill-editor v-model="saveForm.productDetail.intro" v-if="saveForm.productDetail"
                                  :options="quillOption">
                    </quill-editor>
                </el-form-item>
                <el-form-item label="订货须知" prop="orderNotice">
                    <quill-editor v-model="saveForm.productDetail.ordernotice" v-if="saveForm.productDetail"
                                  :options="quillOption">
                    </quill-editor>
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
// 引入富文本
import {quillEditor} from "vue-quill-editor"; //调用编辑器
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';
import quillConfig from '../../common/js/quill-config';

export default {
    components: {
        quillEditor
    },
    data() {
        return {
            filters: {
                name: ''
            },
            // 富文本
            quillOption: quillConfig,
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
            // 大图
            srcList: [],
            // 新增编辑数据验证
            saveFormRules: {
                name: [
                    {required: true, message: '请输入宠物名称', trigger: 'blur'}
                ],
                costprice: [
                    {required: true, message: '请输入成本价', trigger: 'blur'}
                ],
                saleprice: [
                    {required: true, message: '请输入销售价', trigger: 'blur'}
                ],
                shop: [
                    {required: true, message: '请选择所在店铺', trigger: 'blur'}
                ],
                typeId: [
                    {required: true, message: '请选择宠物类型', trigger: 'blur'}
                ],
                user: [
                    {required: true, message: '请选择用户', trigger: 'blur'}
                ]
            },
            //编辑界面数据
            saveForm: {
                id: null,
                name: '',
                costprice: '',
                saleprice: '',
                resources: '',
                salecount: '',
                state: 1,
                offsaletime: '',
                onsaletime: '',
                createtime: '',
                productDetail: {
                    intro: '',
                    ordernotice: ''
                }
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
            this.$http.get("/product").then(res => {
                this.data = res.data;
            });
        },
        //图片预览
        handlePreview(file) {
            console.log(file);
        },
        // 点击图片时的图片预览列表
        maxImg(row, column) {
            if (column.property == "resources") {
                if (!row.resources.includes(',')) {
                    this.srcList = [this.imgPrefix + row.resources];
                    this.listLoading = false;
                } else if (row.resources.includes(',')) {
                    let imgURL = row.resources.split(',');
                    for (let img of imgURL) {
                        this.srcList.push(this.imgPrefix + img);
                    }
                }
            }
        },
        //1.资源图片上传成功之后的处理
        handleSuccess(response, file, fileList) {
            //处理resources - 数据库操作
            if (this.saveForm.resources) { //有值  /group1/M00/00/72/rBEAA2BHkmaAbEOhAAEUusLjqqk505.png
                this.saveForm.resources = this.saveForm.resources + "," + response.resultObj;
            } else {
                this.saveForm.resources = response.resultObj;
            }
            //处理fileList - 页面回显的
            this.fileList = [];//清空
            if (this.saveForm.resources) {
                // /group1/M00/02/1B/rBE3kWHB-cCASterAACabDprSz419.jpeg,/group1/M00/02/1B/rBE3kWHB-caAQ3dYAABiwl7Ttcc206.jpg
                var resourcesArr = this.saveForm.resources.split(",");
                for (var i = 0; i < resourcesArr.length; i++) {
                    this.fileList.push({url: "http://123.207.27.208" + resourcesArr[i]})
                }
            }
        },
        //2.资源图片点击删除时的处理
        handleRemove(file, fileList) {
            //删除fastDfs上的图片
            var filePath = file.url; // http://123.207.27.208/group1/M00/02/1E/rBE3kWHL_GWAAv5mAADpQr0XCJA99.jpeg
            //删除接口需要：/group1/M00/02/1E/rBE3kWHL_GWAAv5mAADpQr0XCJA99.jpeg
            var path = filePath.substring(filePath.indexOf("/group")); // /group1/M00/02/1E/rBE3kWHL_GWAAv5mAADpQr0XCJA99.jpeg
            this.$http.delete("/fastDfs/?path=" + path).then(res => {
                if (res.data.success) {
                    this.$message.success('删除成功!!!');
                } else {
                    this.$message.error('删除失败!!!');
                }
            })
            // /group1/M00/02/1B/rBE3kWHB-cCASterAACabDprSz419.jpeg,/group1/M00/02/1E/rBE3kWHL_GWAAv5mAADpQr0XCJA99.jpeg,/group1/M00/02/1B/rBE3kWHB-caAQ3dYAABiwl7Ttcc206.jpg
            //处理resources - 数据库操作
            if (this.saveForm.resources) {
                //["/group1/M00/02/1B/rBE3kWHB-cCASterAACabDprSz419.jpeg","/group1/M00/02/1E/rBE3kWHL_GWAAv5mAADpQr0XCJA99.jpeg"]
                var pathArr = this.saveForm.resources.split(",");
                for (var i = 0; i < pathArr.length; i++) {
                    var pathTemp = pathArr[i];
                    if (pathTemp == path) { //你要删除的图片找到了
                        //从下标为i的地方开始删除，删1个
                        pathArr.splice(i, 1);
                        break;
                    }
                }
                this.saveForm.resources = pathArr.join(",");
            }
            //处理fileList - 页面回显的
            this.fileList = [];//清空
            if (this.saveForm.resources) {
                // /group1/M00/02/1B/rBE3kWHB-cCASterAACabDprSz419.jpeg,/group1/M00/02/1B/rBE3kWHB-caAQ3dYAABiwl7Ttcc206.jpg
                var resourcesArr = this.saveForm.resources.split(",");
                for (var i = 0; i < resourcesArr.length; i++) {
                    this.fileList.push({url: "http://123.207.27.208" + resourcesArr[i]})
                }
            }
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
            this.$http.post("/product", para).then(res => {
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
        //上架
        onsale() {
            var ids = this.sels.map(item => item.id);
            //获取选中的行
            if (!this.sels || this.sels.length < 1) {
                this.$message({message: '老铁，你不选中数据，臣妾上架不了啊....', type: 'error'});
                return;
            }
            this.$confirm('确认上架选中记录吗？', '提示', {
                type: 'warning'
            }).then(() => {
                this.listLoading = true;
                this.$http.post('/product/onsale', ids).then((res) => {
                    this.listLoading = false;
                    if (res.data.success) {
                        this.$message({
                            message: '上架成功',
                            type: 'success'
                        });
                    } else {
                        this.$message({
                            message: res.data.msg,
                            type: 'error'
                        });
                    }
                    this.getTableData();
                }).catch(res => {
                    this.$message({
                        message: "系统错误，请稍后重试!!!",
                        type: 'error'
                    });
                })
            }).catch(() => {
            });
        },
        //下架
        offsale() {
            var ids = this.sels.map(item => item.id);
            //获取选中的行
            if (!this.sels || this.sels.length < 1) {
                this.$message({message: '老铁，你不选中数据，臣妾下架不了啊....', type: 'error'});
                return;
            }
            this.$confirm('确认下架选中记录吗？', '提示', {
                type: 'warning'
            }).then(() => {
                this.listLoading = true;
                this.$http.post('/product/offsale', ids).then((res) => {
                    this.listLoading = false;
                    if (res.data.success) {
                        this.$message({
                            message: '下架成功',
                            type: 'success'
                        });
                    } else {
                        this.$message({
                            message: res.data.msg,
                            type: 'error'
                        });
                    }
                    this.getTableData();
                }).catch(res => {
                    this.$message({
                        message: "系统错误，请稍后重试!!!",
                        type: 'error'
                    });
                })
            }).catch(() => {
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
                this.$http.delete("/product/" + row.id).
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
            this.getSearchMasterMsgs();
            //图片回显
            this.fileList = [];
            if (this.saveForm.resources) {//有值
                let arr = this.saveForm.resources.split(",");
                for (var i = 0; i < arr.length; i++) {
                    this.fileList.push({"url": "http://123.207.27.208" + arr[i]});
                }
            }
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
                resources: '',
                salecount: '',
                state: 1,
                offsaletime: '',
                onsaletime: '',
                createtime: '',
                productDetail: {
                    intro: '',
                    ordernotice: ''
                }
            };
            //清空图片列表
            this.fileList = [];
            this.getData();
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
                        this.$http.put("/product", paras).then(res => {
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
                this.$http.patch("/product", ids).then(res => {
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