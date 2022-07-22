<template>
    <section class="chart-container">
        <el-row>
            <el-col :span="12">
                <div id="chartColumn" style="width:100%; height:400px;"></div>
            </el-col>
            <el-col :span="12">
                <div id="chartBar" style="width:100%; height:400px;"></div>
            </el-col>
            <el-col :span="12">
                <div id="chartLine" style="width:100%; height:400px;"></div>
            </el-col>
            <el-col :span="12">
                <div id="chartPie" style="width:100%; height:400px;"></div>
            </el-col>
        </el-row>
    </section>
</template>

<script>
import echarts from 'echarts'

export default {
    data() {
        return {
            chartColumn: null,
            chartBar: null,
            chartLine: null,
            chartPie: null
        }
    },

    methods: {
        drawColumnChart() {
            this.$http.get("/shop/echarts").then(res => {
                this.chartColumn = echarts.init(document.getElementById('chartColumn'));
                var arr = res.data;
                var states = arr.map(obj => {
                    return obj.state;
                });
                var countNums = arr.map(obj => {
                    return obj.countNum;
                })
                //将状态的1234 - 转成待审核,待激活,激活成功,驳回
                for (let i = 0; i < states.length; i++) {
                    if (states[i] == 1) {
                        states.splice(i, 1, "待审核"); //替换 i表示下标 1 表示从下标往后替换多少个
                    }
                    if (states[i] == 2) {
                        states.splice(i, 1, "待激活");
                    }
                    if (states[i] == 3) {
                        states.splice(i, 1, "激活成功");
                    }
                    if (states[i] == 4) {
                        states.splice(i, 1, "驳回");
                    }
                }
                this.chartColumn.setOption({
                    title: {text: 'Column Chart'},
                    tooltip: {},
                    xAxis: {
                        data: states
                    },
                    yAxis: {}, //y轴数据会根据data集合中的数据自动平均分配
                    series: [{
                        name: '销量',
                        type: 'bar',
                        data: countNums //就一个一个集合按照状态升序的
                    }]
                });
            });
        },
        drawBarChart() {
            this.chartBar = echarts.init(document.getElementById('chartBar'));
            this.chartBar.setOption({
                title: {
                    text: 'Bar Chart',
                    subtext: '数据来自网络'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                legend: {
                    data: ['2011年', '2012年']
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'value',
                    boundaryGap: [0, 0.01]
                },
                yAxis: {
                    type: 'category',
                    data: ['巴西', '印尼', '美国', '印度', '中国', '世界人口(万)']
                },
                series: [
                    {
                        name: '2011年',
                        type: 'bar',
                        data: [18203, 23489, 29034, 104970, 131744, 630230]
                    },
                    {
                        name: '2012年',
                        type: 'bar',
                        data: [19325, 23438, 31000, 121594, 134141, 681807]
                    }
                ]
            });
        },
        drawLineChart() {
            this.chartLine = echarts.init(document.getElementById('chartLine'));
            this.chartLine.setOption({
                title: {
                    text: 'Line Chart'
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: ['邮件营销', '联盟广告', '搜索引擎']
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        name: '邮件营销',
                        type: 'line',
                        stack: '总量',
                        data: [120, 132, 101, 134, 90, 230, 210]
                    },
                    {
                        name: '联盟广告',
                        type: 'line',
                        stack: '总量',
                        data: [220, 182, 191, 234, 290, 330, 310]
                    },
                    {
                        name: '搜索引擎',
                        type: 'line',
                        stack: '总量',
                        data: [820, 932, 901, 934, 1290, 1330, 1320]
                    }
                ]
            });
        },
        drawPieChart() {
            this.chartPie = echarts.init(document.getElementById('chartPie'));
            this.chartPie.setOption({
                title: {
                    text: 'Pie Chart',
                    subtext: '纯属虚构',
                    x: 'center'
                },
                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                },
                legend: {
                    orient: 'vertical',
                    left: 'left',
                    data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']
                },
                series: [
                    {
                        name: '访问来源',
                        type: 'pie',
                        radius: '55%',
                        center: ['50%', '60%'],
                        data: [
                            {value: 335, name: '直接访问'},
                            {value: 310, name: '邮件营销'},
                            {value: 234, name: '联盟广告'},
                            {value: 135, name: '视频广告'},
                            {value: 1548, name: '搜索引擎'}
                        ],
                        itemStyle: {
                            emphasis: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            });
        },
        drawCharts() {
            this.drawColumnChart()
            this.drawBarChart()
            this.drawLineChart()
            this.drawPieChart()
        },
    },

    mounted: function () {
        this.drawCharts()
    },
    updated: function () {
        this.drawCharts()
    }
}
</script>

<style scoped>
.chart-container {
    width: 100%;
    float: left;
}

/*.chart div {
    height: 400px;
    float: left;
}*/

.el-col {
    padding: 30px 20px;
}
</style>
