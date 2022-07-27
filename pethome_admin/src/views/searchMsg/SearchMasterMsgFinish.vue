<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="query">
				<el-form-item>
					<el-input v-model="query.keyword" placeholder="关键字"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="search">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--列表:优秀实践，copy domain修改列表-->
		<el-table :data="pageData.data" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="expand">
				<template slot-scope="props">
					<el-table :data="props.row.auditLogs" style="width: calc(100% - 47px)" class="two-list">
						<el-table-column type="selection" width="55">
						</el-table-column>
						<el-table-column type="index" width="60">
						</el-table-column>
						<el-table-column prop="state" label="状态">
							<template slot-scope="props">
							  <span v-if="props.row.state ==1">
								<span style="color:#00B46D">通过</span>
							  </span>
								<span v-else>
								<span style="color:#D75C89">驳回</span>
                 			 </span>
							</template>
						</el-table-column>
						<el-table-column prop="note" label="备注"></el-table-column>
						<el-table-column prop="auditManager.username" label="审核人员"></el-table-column>
						<el-table-column prop="audit_time" label="审核时间"></el-table-column>
					</el-table>
				</template>
			</el-table-column>
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" width="60">
			</el-table-column>
			<el-table-column prop="title" label="标题" width="250" sortable>
			</el-table-column>
			<el-table-column prop="name" label="名称" width="100" sortable>
			</el-table-column>
			<el-table-column prop="price" label="价格" width="120" sortable>
			</el-table-column>
			<el-table-column prop="type.name" label="品种"  width="120" sortable>
			</el-table-column>
			<el-table-column prop="user.username" label="用户"  width="200" sortable>
			</el-table-column>
			<el-table-column prop="shop.name" label="店铺"  width="100" sortable>
			</el-table-column>
			<el-table-column label="操作" min-width="120">
				<template scope="scope">
					<el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
					<el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具条-->
		<el-col :span="24" class="toolbar">
			<el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
			<el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :current-page="query.currentPage" :page-size="query.pageSize" :total="pageData.total" style="float:right;">
			</el-pagination>
		</el-col>

		<!--编辑界面
		    v-model="editFormVisible" 老版本打开对话框
		-->
		<el-dialog :title="title"  :visible.sync="searchMasterMsgFormVisible" :close-on-click-modal="false">


			<!--ref="searchMasterMsgForm" 指定表单名称，以后可以通过this.$refs.searchMasterMsgForm-->
			<el-form :model="searchMasterMsg" label-width="80px" :rules="searchMasterMsgFormRules" ref="searchMasterMsgForm">
				<el-form-item label="名称" prop="name">
					<el-input v-model="searchMasterMsg.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="标识" prop="sn">
					<el-input v-model="searchMasterMsg.sn" auto-complete="off"></el-input>
				</el-form-item>
				<!--<el-form-item label="路径" prop="dirPath">-->
					<!--<el-input v-model="searchMasterMsg.dirPath" auto-complete="off"></el-input>-->
				<!--</el-form-item>-->
				<el-form-item label="状态">
					<el-radio-group v-model="searchMasterMsg.state">
						<el-radio class="radio" :label="0">正常</el-radio>
						<el-radio class="radio" :label="-1">禁用</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="部门经理">
					<!--下拉框-->
					<el-select v-model="searchMasterMsg.manager" value-key="id" placeholder="请选择" style="width: 350px">
						<el-option
								v-for="employee in employees"
								:key="employee.id"
								:label="employee.username"
								:value="employee">
							<span style="float: left">{{ employee.username }}</span>
							<span style="float: right; color: #8492a6; font-size: 13px">{{ employee.email }}</span>
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="上级部门" prop="parent">
					<el-cascader v-model="searchMasterMsg.parent"
							:options="deptTree"
							:props="{
									checkStrictly: true,
									label:'name',
									value:'id'
							    }"
							clearable></el-cascader>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="searchMasterMsgFormVisible = false">取消</el-button>
				<el-button type="primary" @click.native="save" :loading="searchMasterMsgLoading">保存</el-button>
			</div>
		</el-dialog>

	</section>
</template>

<script>
	export default {
		data() {
			return {
			    title:'',
				pageData:{
				    total:0,//分页条
					data:[]//数据表格
				},
				query:{
				    keyword:'',
				    currentPage:1,//分页条
					pageSize:10 //分页条
				},
				listLoading: false,
				sels: [],//列表选中列
				searchMasterMsgFormVisible: false,//编辑界面是否显示
				searchMasterMsgLoading: false,
				searchMasterMsgFormRules: {
					name: [
						{ required: true, message: '请输入名称', trigger: 'blur' }
					],
                    sn: [
                        { required: true, message: '请输入标识', trigger: 'blur' }
                    ]
				},

				//编辑界面数据
				searchMasterMsg: {
					id: null,
					name: '',
					sn: '',
                    dirPath:'',
					state: 0,
                    manager: {},
                    parent: null
				},
			}
		},
		methods: {
			search(){
			    //修改页码
			    this.query.currentPage =1;
			    //改查询条件=双向绑定输入时自动改变，只需要重新查询一次就ok
			    this.getSearchMasterMsgs();
			},
			handleCurrentChange(val) {
				this.query.currentPage = val;
				this.getSearchMasterMsgs();
			},
			//获取用户列表
			getSearchMasterMsgs() {
				this.listLoading = true; //加载条
				this.$http.post("/searchMasterMsg/finish",this.query)
                    .then(result => {
                        this.pageData = result.data;
                        this.listLoading = false; //去除加载条
                    })
					.catch(result=>{
					    alert("抱错了！");
					})

			},
			//删除
			handleDel: function (index, row) {
				this.$confirm('确认删除该记录吗?', '温馨提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					let url = "/searchMasterMsg/"+row.id;
					this.$http.delete(url)
                        .then((result) => {
                            console.log(result)
							result = result.data; //{sucesss:true,message:"xx"}
                            this.listLoading = false;
                            if(result.success){ //成功提示
                                this.$message({
                                    message: '删除成功',
                                    type: 'success'
                                });
							}else{
                                this.$message({ //错误提示
                                    message: result.message,
                                    type: 'error'
                                });
							}
							//重新加载数据
                            this.getSearchMasterMsgs();
                        });
                }).catch(() => {
                });
			},
			//显示编辑界面
			handleEdit: function (index, row) {
			    //修改对话框标题
                this.title = "修改部门"
				this.searchMasterMsgFormVisible = true;
				//回显
				this.searchMasterMsg = Object.assign({}, row);

			},
			//显示新增界面
			handleAdd: function () {
                //修改对话框标题
                this.title = "添加部门"
			    //弹出对话框
				this.searchMasterMsgFormVisible = true;
                //置空数据，防止先点修改，后点添加有值
				this.searchMasterMsg =  {
                    id: null,
                    name: '',
                    sn: '',
                    dirPath:'',
                    state: 0,
                    manager: {},
                    parent: null
                };
			},
			//保存
            save: function () {
				this.$refs.searchMasterMsgForm.validate((valid) => {
					if (valid) {
						this.$confirm('确认保存吗？', '提示', {}).then(() => {
							this.searchMasterMsgLoading = true;
							let para = Object.assign({}, this.searchMasterMsg);
                            console.log(this.searchMasterMsg.parent)
							//处理上级部门参数格式 parent:[1,34]---->parent:{id:34}
							let parentArr = para.parent;
							if(parentArr){
                                para.parent = {"id":parentArr[parentArr.length-1]}
							}
							this.$http.put("/searchMasterMsg",para)
							  .then((result) => {
								this.searchMasterMsgLoading = false;
								result = result.data;
								if(result.success){
                                    this.$message({
                                        message: '提交成功',
                                        type: 'success'
                                    });
                                    this.searchMasterMsgFormVisible = false; //关闭对话框
                                    this.$refs['searchMasterMsgForm'].resetFields();//重置表单
                                    this.getSearchMasterMsgs(); //重新加载
								}else{
                                    this.$message({
                                        message: result.message,
                                        type: 'error'
                                    });
                                    //失败了可能修改了提交
								}
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
			    //遍历选择记录把id放到一个数组中
				var ids = this.sels.map(item => item.id); //[1,2,3]
				this.$confirm('确认删除选中记录吗？', '温馨提示', {
					type: 'warning'
				}).then(() => {
					this.listLoading = true;
					this.$http.patch("/searchMasterMsg",ids)
						.then((result) => {
							this.listLoading = false;
							result = result.data;
							if(result.success){
                                this.$message({
                                    message: '删除成功',
                                    type: 'success'
                                });
							}else{
                                this.$message({
                                    message:result.message,
                                    type: 'error'
                                });
                            }
                            //跳转到第一页
                            this.handleCurrentChange(1);
					});
				}).catch(() => {

				});
			}
		},
		mounted() {
			this.getSearchMasterMsgs();
		}
	}

</script>

<style scoped>

</style>