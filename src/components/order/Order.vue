<template>
    <div>
        <!--面包屑-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{path: '/home'}">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片区 -->
        <el-card>
            <el-row :gutter="20">
                <el-col :span="10">
                    <el-input v-model="queryInfo.query"
                              placeholder="请输入内容"
                              clearable>
                        <el-button slot="append" icon="el-icon-search" @click="searchOrder"></el-button>
                    </el-input>
                </el-col>
            </el-row>
            <!-- 订单数据区 -->
            <el-table
                highlight-current-row
                border
                stripe
                :data="orderList"
                style="width: 100%">
                <el-table-column type="index" label="序号"></el-table-column>
                <el-table-column header-align="center"
                                 width="200px"
                                 prop="order_number"
                                 label="订单编号">
                </el-table-column>
                <el-table-column header-align="center"
                                 align="right"
                                 prop="order_price"
                                 label="订单价格">
                </el-table-column>
                <el-table-column align="center"
                                 width="100px"
                                 prop="pay_status"
                                 label="是否付款">
                    <template v-slot="scope">
                        <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
                        <el-tag type="danger" v-else>未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column align="center"
                                 prop="is_send"
                                 label="是否发货">
                </el-table-column>
                <el-table-column align="center"
                                 prop="create_time"
                                 label="下单时间">
                    <template v-slot="scope">
                        {{scope.row.create_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" align="center">
                    <template v-slot="scope">
                        <el-button @click="showBox(scope.row)" size="mini" type="primary"
                                   icon="el-icon-edit">
                        </el-button>
                        <el-button size="mini"
                                   type="success"
                                   icon="el-icon-location"
                                   @click="showProgressBox">
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[5,10,50, 100]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="this.total">
            </el-pagination>
        </el-card>
        <!-- 修改地址的对话框 -->
        <el-dialog
            title="修改地址"
            :visible.sync="addressDialogVisible"
            width="50%"
            :close-on-click-modal="false"
            @close="addressDialogClosed">
            <el-form ref="addressFormRef"
                     :model="addressForm"
                     :rules="addressFormRules"
                     label-width="100px">
                <el-form-item label="省市区县" prop="address1">
                    <!--<el-input v-model="addressForm.address1"></el-input>-->
                    <el-cascader
                        :options="cityData"
                        v-model="selectedCity"
                        :props="cascaderProps"
                        @change="handleChange"></el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                    <el-input v-model="addressForm.address2"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
            <el-button @click="addressDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addressDialogVisible = false">确 定</el-button>
          </span>
        </el-dialog>
        <!-- 物流信息对话框-->
        <el-dialog
            title="物流进度"
            :visible.sync="progressDialogVisible"
            :close-on-click-modal="false"
            width="50%">

            <!-- 时间线组件 -->
            <el-timeline :reverse="reverse">
                <el-timeline-item
                    v-for="(activity, index) in progress"
                    :key="index"
                    :timestamp="activity.time">
                    {{activity.context}}
                </el-timeline-item>
            </el-timeline>

        </el-dialog>
    </div>
</template>

<script>
    import cityData from './cityData'

    export default {
        name: "Order",

        data() {
            return {
                // 查询对象
                queryInfo: {
                    query: "",
                    pagenum: 1,
                    pagesize: 10,
                    user_id: "",
                    pay_status: "",
                    is_send: "",
                    order_fapiao_title: "",
                    order_fapiao_company: "",
                    order_fapiao_content: "",
                    consignee_addr: "",
                },
                // 订单总数
                total: 0,
                // 列表显示的订单数组
                orderList: [],
                // 修改地址对话框的显示与否
                addressDialogVisible: false,
                // 修改地址对话框的表单对象
                addressForm: {
                    address1: [],
                    address2: "",
                },
                // 表单验证对象
                addressFormRules: {
                    address1: [
                        {required: true, message: "请输入正确的地址信息", trigger: "blur"},
                    ],
                    address2: [
                        {required: true, message: "请输入正确的地址信息", trigger: "blur"},
                    ]
                },
                // 省市县三级联动的数据数组
                cityData: cityData,
                //  被选择的省市县
                selectedCity: [],
                // 级联选择器的props对象
                cascaderProps: {
                    expandTrigger: 'hover',
                    label: 'name',
                    value: 'name',
                    children: 'sub',
                    // 是否可以选择任意一级的选项
                    checkStrictly: true,
                },
                // 物流进度对话框显示控制
                progressDialogVisible: false,
                // 物流数据
                progress: [],
                // 时间轴倒序排列
                reverse:true,

            }
        },
        created() {
            this.getOrderList();
        },
        methods: {
            // 获取订单数据列表
            async getOrderList() {
                const {data: res} = await this.$http.get("orders", {
                    params: this.queryInfo,
                });
                if (res.meta.status !== 200) {
                    return this.$message.error("获取订单列表失败");
                }
                this.orderList = res.data.goods;
                this.total = res.data.total;
                // console.log(this.orderList)
            },

            // 分页器的pagesize发生变化的处理函数
            handleSizeChange(newSize) {
                this.queryInfo.pagesize = newSize;
                this.getOrderList();
            },
            // 分页器pagenum发生变化的处理函数
            handleCurrentChange(newPage) {
                this.queryInfo.pagenum = newPage;
                this.getOrderList();
            },

            // 展示修改地址的对话框
            showBox() {
                this.addressDialogVisible = true;
            },

            // 搜索订单按钮的点击事件函数
            searchOrder() {

            },
            // 省市县三级联动的级联选择器的change事件处理函数
            handleChange() {
                // console.log(this.selectedCity);
            },
            // 修改地址对话框的关闭事件处理函数
            // 清空表单
            addressDialogClosed() {
                this.$refs.addressFormRef.resetFields();
            },
            // 打开物流进度对话框
            async showProgressBox() {
                // 获取物流数据(物流单号是测试数据)
                const {data: res} = await this.$http.get("/kuaidi/1106975712662");
                if (res.meta.status !== 200) {
                    this.$message.error("获取物流数据失败");
                }

                this.progress = res.data;
                console.log(this.progress);
                this.progressDialogVisible = true;
            },


        }
    }
</script>

<style scoped>
    .el-cascader {
        width: 100%;
    }
</style>
