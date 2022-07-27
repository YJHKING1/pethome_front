<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="searchForm">
                <el-form-item>
                    <el-input v-model="searchForm.keyword" placeholder="寻主消息名称"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getSearchMasterMsgs">查询</el-button>
                </el-form-item>
                <!--<el-form-item>-->
                    <!--<el-button type="primary" @click="handleAdd">处理</el-button>-->
                <!--</el-form-item>-->
            </el-form>
        </el-col>

        <!--列表-->
        <el-table :data="searchMasterMsgs" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" width="60">
            </el-table-column>
            <el-table-column prop="name" label="名称" >
            </el-table-column>
            <el-table-column prop="title" label="标题" >
            </el-table-column>
            <el-table-column prop="price" label="价格" >
            </el-table-column>
            <el-table-column prop="age" label="年龄"  >
            </el-table-column>
            <el-table-column prop="gender" label="性别"  >
                <template scope="scope" >
                    <span v-if="scope.row.gender==0" style="color: red">母</span>
                    <span v-if="scope.row.gender!=0" style="color: green">公</span>
                </template>
            </el-table-column>
            <el-table-column prop="coat_color" label="毛色"  >
            </el-table-column>
            <el-table-column prop="address" label="地址"  >
            </el-table-column>
            <el-table-column prop="type.name" label="品种"  >
            </el-table-column>
            <el-table-column prop="user.username" label="用户"  >
            </el-table-column>
            <el-table-column prop="shop.name" label="店铺"  >
            </el-table-column>

            <!--<el-table-column label="操作" width="200">-->
                <!--<template scope="scope">-->
                    <!--<el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>-->
                    <!--<el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>-->
                <!--</template>-->
            <!--</el-table-column>-->
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <!--<el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>-->
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="10" :total="total" style="float:right;">
            </el-pagination>
        </el-col>

        <!--编辑 新增 界面-->
        <el-dialog :title="title"  v-model="editFormVisible" :close-on-click-modal="false">

            <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="editForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="售价" prop="saleprice">
                    <el-input v-model="editForm.saleprice" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="成本价" prop="costprice">
                    <el-input v-model="editForm.costprice" auto-complete="off"></el-input>
                </el-form-item>

                <el-form-item label="资源" prop="resources">
                    <!--<el-input v-model="editForm.resources" auto-complete="off"></el-input>-->
                    <el-upload
                            class="upload-demo"
                            action="/api/dfs"
                            :on-remove="handleRemove"
                            :on-success="handleSuccess"
                            :file-list="fileList"
                            list-type="picture">
                        <el-button size="small" type="primary">点击上传</el-button>
                        <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                    </el-upload>
                </el-form-item>

                <el-form-item label="简介" prop="intro">
                    <!--<el-input v-model="editForm.detail.intro" auto-complete="off"></el-input>-->
                    <quill-editor v-model="editForm.detail.intro" :options="quillOption">
                    </quill-editor>
                </el-form-item>
                <el-form-item label="预约须知" prop="orderNotice" >
                    <!--<el-input v-model="editForm.detail.orderNotice" auto-complete="off"></el-input>-->
                    <quill-editor v-model="editForm.detail.orderNotice" :options="quillOption">
                    </quill-editor>
                </el-form-item>

            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="editFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="editSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>

    </section>
</template>

<script>
    import { quillEditor } from "vue-quill-editor"; //调用编辑器
    import 'quill/dist/quill.core.css';
    import 'quill/dist/quill.snow.css';
    import 'quill/dist/quill.bubble.css';
    /*
    import quillConfig from '../../common/js/quill-config.js'*/
    export default {
        /*components: {
            quillEditor
        },*/
        data() {
            return {
                quillOption: null,
                fileList:[],
                title:'',
                searchForm: {
                    keyword: ''
                },
                searchMasterMsgs: [],
                total: 0,
                page: 1,
                listLoading: false,
                sels: [],//列表选中列

                editFormVisible: false,//编辑界面是否显示
                editLoading: false,
                editFormRules: {
                    name: [
                        { required: true, message: '请输入姓名', trigger: 'blur' }
                    ]
                },
                //编辑界面数据
                editForm: {
                    id: 0,
                    name: '',
                    costprice: 0,
                    saleprice: 0,
                    resources:'',
                    detail:{
                        intro:'',
                        orderNotice:''
                    }
                },

                addFormVisible: false,//新增界面是否显示
                addLoading: false,
                addFormRules: {
                    name: [
                        { required: true, message: '请输入姓名', trigger: 'blur' }
                    ]
                }

            }
        },
        methods: {
            handleSuccess(response, file, fileList){
                console.log("===========")
                console.log(fileList);
                //resultObj 文件的服务器地址，放到数据库中
                //根据双向绑定 logo 就有值 1,2,3
                let resourcesTmp = '';
                if(fileList!=null && fileList.length>0){
                    for(var i=0;i<fileList.length;i++){
                        if(i==0){
                            resourcesTmp = resourcesTmp+fileList[i].response.resultObj;
                        }else{
                            resourcesTmp = resourcesTmp+","+fileList[i].response.resultObj;
                        }
                    }
                }
                this.editForm.resources = resourcesTmp;
                console.log(this.editForm.resources)
            },
            handleRemove(file, fileList) {
                var filePath =file.response.resultObj;
                console.log(fileList)
                this.$http.delete("/common/fastDfs/?path="+filePath)
                    .then(res=>{
                        if(res.data.success){
                            this.$message({
                                message: '删除成功!',
                                type: 'success'
                            });
                        }else{
                            this.$message({
                                message: '删除失败!',
                                type: 'error'
                            });
                        }
                    })

                //删除图片后移除data里面数据
                let resourcesTmp = '';
                if(fileList!=null && fileList.length>0){
                    for(var i=0;i<fileList.length;i++){
                        if(i==0){
                            resourcesTmp = resourcesTmp+fileList[i].response.resultObj;
                        }else{
                            resourcesTmp = resourcesTmp+","+fileList[i].response.resultObj;
                        }
                    }
                }
                this.editForm.resources = resourcesTmp;
                console.log(this.editForm.resources);
            },
            handleCurrentChange(val) {
                this.page = val;
                this.getSearchMasterMsgs();
            },
            //获取用户列表
            getSearchMasterMsgs() {
                let para = {
                    currentPage: this.page,
                    keyword:this.searchForm.keyword
                };
                //打开加载的效果
                this.listLoading = true;
                //
                this.$http.post("/searchMasterMsg/processed",para).then(res=>{
                    this.searchMasterMsgs=res.data.rows;
                    this.total=res.data.total;
                    //关闭加载的效果
                    this.listLoading = false;
                });
            },
            //删除
            handleDel: function (index, row) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    //开启加载的模态框
                    this.listLoading = true;
                    //NProgress.start();
                    console.debug(row)
                    //后台地址的请求
                    this.$http.delete("/searchMasterMsg/"+row.id).then((res) => {
                        this.listLoading = false;
                        console.debug(res);
                        if (res.data.success){
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                        }

                        this.getSearchMasterMsgs();
                    });
                }).catch(() => {

                });
            },
            //显示编辑界面
            handleEdit: function (index, row) {
                this.editFormVisible = true;

                //回显
                console.debug(row)
                console.debug(this.editForm)
                this.editForm = Object.assign({}, row);

                //会显示详情
                this.$http.get("/searchMasterMsg/detail/"+row.id)
                    .then(result=>{
                        this.editForm.detail = result.data;
                    });

                //图片回显
                this.fileList = [];
                var resources =  row.resources;
                var resourcesArr = resources.split(",");
                for(var i=0;i<resourcesArr.length;i++){
                    console.log("http://121.37.194.36"+resourcesArr[i])
                    this.fileList.push({url:"http://121.37.194.36"+resourcesArr[i]})
                }
            },
            //显示新增界面
            handleAdd: function () {
                //打开弹出框
                this.editFormVisible = true;
                this.title='新增寻主消息';
                //初始化表单字段-利用的双向绑定的特性
                this.editForm = {
                    name: '',
                    costprice: 0,
                    saleprice: 0,
                    resources:'',
                    detail:{
                        intro:'',
                        orderNotice:''
                    }
                };
            },
            //编辑
            editSubmit: function () {
                //验证当前的表单是否符合验证规则
                this.$refs.editForm.validate((valid) => {

                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.editLoading = true;
                            //NProgress.start();
                            //把表单的数据组装为json
                            let para = Object.assign({}, this.editForm);

                            //para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');
                            this.$http.put('/searchMasterMsg',para).then((res) => {
                                this.editLoading = false;
                                //NProgress.done();
                                this.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                //重置表单-调用现成的方法
                                this.$refs['editForm'].resetFields();
                                //关闭 加载框
                                this.editFormVisible = false;
                                //重新刷新页面数据
                                this.getSearchMasterMsgs();
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
                    //NProgress.start();
                    let para = { ids: ids };
                    this.$http.post('/searchMasterMsg/dels',ids).then((res) => {
                        this.listLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getSearchMasterMsgs();
                    });
                }).catch(() => {

                });
            }
        },
        mounted() {
            //当页面加载完以后。执行的方法
            this.getSearchMasterMsgs();
        }
    }

</script>

<style scoped>

</style>