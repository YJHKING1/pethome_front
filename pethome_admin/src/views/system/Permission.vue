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
            </el-form>
        </el-col>

        <!--列表:优秀实践，copy domain修改列表-->
        <el-table :data="pageData.data" highlight-current-row v-loading="listLoading" style="width: 100%;">
            <el-table-column type="index" width="60">
            </el-table-column>
            <el-table-column prop="name" label="名称" width="240" sortable>
            </el-table-column>
            <el-table-column prop="url" label="资源地址" width="380" sortable>
            </el-table-column>
            <el-table-column prop="sn" label="权限编码" sortable>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange"
                           :current-page="query.currentPage" :page-size="query.pageSize" :total="pageData.totals"
                           style="float:right;">
            </el-pagination>
        </el-col>
    </section>
</template>

<script>
export default {
    data() {
        return {
            title: '',
            pageData: {
                totals: 0,//分页条
                data: []//数据表格
            },
            query: {
                keyword: '',
                currentPage: 1,//分页条
                pageSize: 10 //分页条
            },
            listLoading: false,
        }
    },
    methods: {
        search() {
            //修改页码
            this.query.currentPage = 1;
            //改查询条件=双向绑定输入时自动改变，只需要重新查询一次就ok
            this.getPermissions();
        },
        handleCurrentChange(val) {
            this.query.currentPage = val;
            this.getPermissions();
        },
        //获取用户列表
        getPermissions() {
            this.listLoading = true; //加载条
            this.$http.post("/permission", this.query)
                .then(result => {
                    this.pageData = result.data;
                    this.listLoading = false; //去除加载条
                })
                .catch(result => {
                    alert("抱错了！");
                })
        }
    },
    mounted() {
        this.getPermissions();
    }
}

</script>

<style scoped>

</style>