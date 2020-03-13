<template>
    <div>
        <!--面包屑-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{path: '/home'}">首页</el-breadcrumb-item>
            <el-breadcrumb-item>数据统计</el-breadcrumb-item>
            <el-breadcrumb-item>数据报表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片 -->
        <el-card>
            <div id="main" style="width: 750px;height:400px;"></div>
        </el-card>
    </div>
</template>

<script>
    //导入echarts
    import echarts from "echarts"
    import _ from "lodash"


    export default {
        name: "Report",
        data() {
            return {
                // 图表需要合并的选项
                options: {
                    title: {
                        text: '用户来源'
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'cross',
                            label: {
                                backgroundColor: '#E9EEF3'
                            }
                        }
                    },
                    grid: {
                        left: '3%',
                        right: '4%',
                        bottom: '3%',
                        containLabel: true
                    },
                    xAxis: [
                        {
                            boundaryGap: false
                        }
                    ],
                    yAxis: [
                        {
                            type: 'value'
                        }
                    ]
                },
            }
        },
        created() {
        },
        // DOM初始化结束后的钩子函数，执行到mounted()函数时，说明此时页面的DOM元素都已经初始化完毕了。
        async mounted() {
            // 基于准备好的dom，初始化echarts实例
            let myChart = echarts.init(document.getElementById('main'));

            // 从后端获取图表的数据
            const {data: res} = await this.$http.get("reports/type/1");
            if (res.meta.status !== 200) {
                return this.$message.error("图表数据获取失败");
            };

            //将数据和图表的配置项合并
            const result = _.merge(res.data, this.options);

            myChart.setOption(result);
        },
        methods: {},
        components: {}
    }
</script>

<style scoped>

</style>
