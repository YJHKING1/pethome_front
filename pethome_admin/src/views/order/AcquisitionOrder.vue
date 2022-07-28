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

        <!--列表
           @selection-change="selsChange" 选的不一样就会触发
        -->
        <el-table :data="acquisitionOrders" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
                  style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" width="60">
            </el-table-column>
            <el-table-column prop="ordersn" label="订单号" width="120" sortable>
            </el-table-column>
            <el-table-column prop="digest" label="摘要" width="180" sortable>
            </el-table-column>
            <el-table-column prop="price" label="价格" width="80" sortable>
            </el-table-column>
            <el-table-column prop="state" label="状态" width="80" sortable>
                <template scope="scope">
                    <span style="color: green" v-if="scope.row.state==0">待处理</span>
                    <span style="color: red" v-else-if="scope.row.state==-1">取消</span>
                    <span style="color: darkblue" v-else>完成</span>
                </template>
            </el-table-column>
            <el-table-column prop="address" label="地址" width="200" sortable>
            </el-table-column>
            <el-table-column label="操作">
                <template scope="scope">
                    <el-button size="small" @click="handleConfirm(scope.$index, scope.row)"
                               :disabled="scope.row.state!=0">订单确认
                    </el-button>
                    <el-button type="danger" size="small" @click="handleCancel(scope.$index, scope.row)"
                               :disabled="scope.row.state!=0">取消
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" :disabled="this.sels.length===0">批量删除</el-button>
            <el-pagination layout="prev, pager, next" :current-page="currentPage" @current-change="handleCurrentChange"
                           :page-size="pageSize" :total="totals" style="float:right;">
            </el-pagination>
        </el-col>

        <!--订单处理对话框-->
        <el-dialog title="确认订单" :visible.sync="acquisitionOrderFormVisible" :close-on-click-modal="false">
            <el-form :model="acquisitionOrderForm" label-width="80px" :rules="acquisitionOrderFormRules"
                     ref="acquisitionOrderForm">
                <el-form-item label="支付方式" prop="payType">
                    <el-select v-model="acquisitionOrderForm.payType" placeholder="请选择">
                        <el-option
                            v-for="item in payTypeOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="支付金额" prop="money">
                    <el-input v-model="acquisitionOrderForm.money" style="width: 200px" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="acquisitionOrderFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="confirmOrder" :loading="acquisitionOrderLoading">确认
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
            acquisitionOrders: [],
            listLoading: false,
            currentPage: 1,
            pageSize: 5,
            totals: 0,

            //高级查询所需数据
            keyword: null,

            //多条数据选中
            sels: [],//列表选中列

            acquisitionOrderFormVisible: false,//新增界面是否显示
            acquisitionOrderLoading: false,
            acquisitionOrderFormRules: {},
            acquisitionOrderForm: {
                id: null,
                paytype: '',
                money: ''
            },

            //支持三种选项
            payTypeOptions: [{
                value: 0,
                label: '余额'
            }, {
                value: 1,
                label: '垫付'
            }, {
                value: 2,
                label: '银行转账'
            }],
        }
    },
    methods: {
        keywordQuery() {
            //查询完，原来分页条件已经没用了，要跑到第一页去
            this.currentPage = 1;
            this.getAcquisitionOrders();
        },

        handleCurrentChange(val) {
            this.currentPage = val;
            this.getAcquisitionOrders();
        },

        //获取收购订单列表
        getAcquisitionOrders() {
            let para = {
                currentPage: this.currentPage,
                pageSize: this.pageSize,
                keyword: this.keyword
            };
            this.listLoading = true;
            this.$http.post("/orderPetAcquisition", para).then(res => {
                this.totals = res.data.totals;
                this.acquisitionOrders = res.data.data;
                this.listLoading = false;
            }).catch(result => {
                alert("系统错误！")
            })
        },


        //显示编辑界面
        handleConfirm: function (index, row) {
            //重置
            this.acquisitionOrderForm = {
                id: null,
                payType: '',
                money: ''
            }
            //设置id
            this.acquisitionOrderForm.id = row.id;
            this.acquisitionOrderFormVisible = true; // 显示编辑框
        },

        //保存
        confirmOrder: function () {
            this.$refs.acquisitionOrderForm.validate((valid) => {
                if (valid) {
                    this.$confirm('确认订单吗？', '温馨提示', {}).then(() => {
                        this.acquisitionOrderLoading = true;
                        //拷贝一份新数据
                        let para = Object.assign({}, this.acquisitionOrderForm);
                        this.$http.post("/orderPetAcquisition/confirm", para).then(res => {
                            //去除忙等框
                            this.acquisitionOrderLoading = false;
                            //做提示
                            if (res.data.success) {
                                this.$message({
                                    message: '操作成功',
                                    type: 'success'
                                });
                            } else {
                                this.$message({
                                    message: res.data.message,
                                    type: 'error'
                                });
                            }
                            //关闭对话框
                            this.acquisitionOrderFormVisible = false;
                            //重新查询数据
                            this.getAcquisitionOrders();
                        }).catch(result => {
                            alert("系统错误！");
                            this.acquisitionOrderLoading = false;
                        });
                    });
                }
            });
        },

        //所有选中对象都会传进来
        selsChange: function (sels) {
            this.sels = sels;
            console.log(this.sels)
        },

        //删除
        handleCancel: function (index, row) {
            this.$confirm('确认取消该订单吗?', '温馨提示', {
                type: 'warning'
            }).then(() => {
                this.listLoading = true;
                let url = "/orderPetAcquisition/" + row.id;
                this.$http.delete(url).then(res => {
                    //去除忙等框
                    this.listLoading = false;
                    if (res.data.success) {
                        this.currentPage = 1;
                        //提示
                        this.$message({
                            message: '取消成功',
                            type: 'success'
                        });
                        //重新查询数据
                        this.getAcquisitionOrders();
                    } else {
                        //提示
                        this.$message({
                            message: res.data.message,
                            type: 'error'
                        });
                        //重新查询数据
                        this.getAcquisitionOrders();
                    }
                }).catch(result => {
                    //去除忙等框
                    this.listLoading = false;
                    //提示
                    this.$message({
                        message: '系统错误！',
                        type: 'error'
                    });
                })

            }).catch(() => {
            });
        }
    },

    mounted() {
        this.getAcquisitionOrders();
    }
}

</script>

<style scoped>

</style>