<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true">
                <el-form-item>
                    <el-input v-model="keyword" placeholder="关键字"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="keywordQuery">查询</el-button>
                </el-form-item>
            </el-form>
        </el-col>


        <el-table :data="searchMasterMsgs" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
                  style="width: 100%;">
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
            <el-table-column prop="type.name" label="品种" width="120" sortable>
            </el-table-column>
            <el-table-column prop="user.username" label="用户" width="200" sortable>
            </el-table-column>
            <el-table-column prop="shop.name" label="店铺" width="120" sortable>
            </el-table-column>
            <el-table-column label="操作" min-width="120">
                <template scope="scope">
                    <el-button size="small" @click="handleAccept(scope.$index, scope.row)">接单</el-button>
                    <el-button type="danger" size="small" @click="rejectOrder(scope.$index, scope.row)">拒单</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" :disabled="this.sels.length===0">批量删除</el-button>
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :current-page="currentPage"
                           :page-size="pageSize" :total="totals" style="float:right;">
            </el-pagination>
        </el-col>

        <!--编辑界面
            v-model="editFormVisible" 老版本打开对话框
        -->
        <el-dialog title="接单" :visible.sync="acceptSearchMasterMsgFormVisible" :close-on-click-modal="false">
            <!--ref="searchMasterMsgForm" 指定表单名称，以后可以通过this.$refs.searchMasterMsgForm-->
            <el-form :model="acceptOrderForm" label-width="80px" :rules="acceptSearchMasterMsgFormRules"
                     ref="acceptSearchMasterMsgForm">
                <el-form-item label="处理人">
                    <!--下拉框-->
                    <el-select v-model="acceptOrderForm.handler" value-key="id" placeholder="请选择"
                               style="width: 350px">
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
                <el-form-item label="备注" prop="sn">
                    <el-input v-model="acceptOrderForm.note" auto-complete="off"></el-input>
                </el-form-item>
                接单完成后，就会创建对应收购订单！请到收购订单中操作！
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="acceptSearchMasterMsgFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="acceptOrder" :loading="acceptSearchMasterMsgLoading">确定
                </el-button>
            </div>
        </el-dialog>

    </section>
</template>

<script>
export default {
    data() {
        return {
            //分页显示所属数据
            searchMasterMsgs: [],
            listLoading: false,
            currentPage: 1,
            pageSize: 5,
            totals: 0,

            //高级查询所需数据
            keyword: null,

            employees: [],

            sels: [],//列表选中列

            acceptSearchMasterMsgFormVisible: false,//接单界面对话框是否显示
            acceptSearchMasterMsgLoading: false, //接单界面加载框
            acceptSearchMasterMsgFormRules: {
                note: [
                    {required: true, message: '请输入备注！', trigger: 'blur'}
                ]
            },
            //接口对话框数据
            acceptOrderForm: {
                id: null,
                handler: {},
                note: ''
            },
        }
    },
    methods: {

        //接单
        acceptOrder() {
            //消息id 处理人 note
            this.$http.post("/searchMasterMsg/accept",
                {
                    msgId: this.acceptOrderForm.id,
                    handler: this.acceptOrderForm.handler.id,
                    note: this.acceptOrderForm.note
                })
                .then(res => {
                    this.listLoading = false;
                    if (res.data.success) { //成功提示
                        this.$message.success("接单成功");
                    } else {
                        this.$message.error("系统错误【500】");
                    }
                    this.acceptSearchMasterMsgFormVisible = false;//关闭对话框
                    //重新加载数据
                    this.getSearchMasterMsgs();
                });
        },

        //高级查询
        keywordQuery() {
            //修改页码
            this.currentPage = 1;
            //改查询条件=双向绑定输入时自动改变，只需要重新查询一次就ok
            this.getSearchMasterMsgs();
        },

        //点击某一页的处理
        handleCurrentChange(val) {
            this.currentPage = val;
            this.getSearchMasterMsgs();
        },

        //获取用户列表
        getSearchMasterMsgs() {
            let paras = {
                currentPage: this.currentPage,
                pageSize: this.pageSize,
                keyword: this.keyword
            };
            this.listLoading = true;
            this.$http.post("/searchMasterMsg/toHandle", paras).then(res => {
                this.totals = res.data.totals;
                this.searchMasterMsgs = res.data.data;
                this.listLoading = false;
            }).catch(result => {
                this.$message.error("获取分页数据失败!!!");
            })
        },

        //拒单
        rejectOrder: function (index, row) {
            this.$confirm('确认拒绝吗?', '温馨提示', {
                type: 'warning'
            }).then(() => {
                this.listLoading = true;
                let url = "/searchMasterMsg/reject/" + row.id;
                this.$http.get(url).then(res => {
                    if (res.data.success) { //成功提示
                        this.$message.success("拒绝成功");
                    } else {
                        this.$message.success("服务器错误");
                    }
                    this.listLoading = false;
                    //重新加载数据
                    this.getSearchMasterMsgs();
                });
            }).catch(() => {
                this.$message.success("系统错误");
            });
        },

        //显示接单界面
        handleAccept: function (index, row) {
            this.acceptOrderForm.id = row.id;
            if (row.shop) {
                let shopId = row.shop.id;
                this.getEmployees(shopId);
            }
            this.acceptSearchMasterMsgFormVisible = true;
        },


        selsChange: function (sels) {
            this.sels = sels;
        },

        //获取当前店铺的所有人：其实我们的系统就一个店铺管理员
        getEmployees(shopId) {
            this.$http.get("/employee/list/" + shopId).then(result => {
                this.employees = result.data;
            })
        }

    },
    mounted() {
        this.getSearchMasterMsgs();
    }
}

</script>

<style scoped>

</style>