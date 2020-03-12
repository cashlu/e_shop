<template>
    <div>
        <!--FIXME: 这个页面没有激活左侧的菜单项，查看Home.vue，可能有解决的方法。-->
        <!--面包屑-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{path: '/home'}">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片区 -->
        <el-card>
            <!-- 搜索表单区 -->
            <!-- :gutter="20" 是让row中的各个col间距20px -->
            <el-row :gutter="20">
                <!-- :span="10" 是让这个col占10/24的位置 -->
                <el-col :span="10">
                    <el-input
                        clearable
                        @clear="getGoodsList"
                        v-model="queryInfo.query"
                        placeholder="请输入商品名称">
                        <el-button slot="append"
                                   icon="el-icon-search"
                                   @click="getGoodsList">
                        </el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="goAddPage">添加商品</el-button>
                </el-col>
            </el-row>
            <!-- 商品列表区 -->
            <el-table
                :data="goodsList"
                style="width: 100%"
                border
                stripe>
                <!-- 索引列 -->
                <el-table-column type="index" label="序号">
                </el-table-column>
                <!-- 数据列 -->
                <el-table-column header-align="center"
                                 prop="goods_name"
                                 label="商品名称">
                </el-table-column>
                <el-table-column width="95px"
                                 header-align="center"
                                 align="right"
                                 prop="goods_price"
                                 label="价格(元)">
                </el-table-column>
                <el-table-column width="70px"
                                 header-align="center"
                                 align="center"
                                 prop="goods_weight"
                                 label="商品重量">
                </el-table-column>
                <el-table-column width="140px"
                                 header-align="center"
                                 align="center"
                                 prop="add_time"
                                 label="创建时间">
                    <template v-slot="scope">
                        {{scope.row.add_time | dateFormat}}
                    </template>
                </el-table-column>
                <!-- 操作按钮 -->
                <el-table-column width="130px"
                                 header-align="center"
                                 align="center"
                                 label="操作">
                    <template v-slot="scope">
                        <!-- 编辑按钮 -->
                        <el-button size="mini"
                                   type="primary"
                                   icon="el-icon-edit">
                        </el-button>
                        <!-- 删除按钮 -->
                        <el-button size="mini"
                                   type="danger"
                                   icon="el-icon-delete"
                        @click="deleteGoodById(scope.row.goods_id)">
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <!--  分页  -->
            <el-pagination
                background
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[5, 10, 20, 50]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="this.total">
            </el-pagination>
        </el-card>
    </div>
</template>

<script>
    export default {
        name: "List",
        data() {
            return {
                queryInfo: {
                    query: "",
                    pagenum: 1,
                    pagesize: 10,
                },
                // 商品列表
                goodsList: [],
                // 总商品的数量
                total: 0,
            }
        },
        methods: {
            // 根据分页获取所有商品的列表
            async getGoodsList() {
                const {data: res} = await this.$http.get("goods", {
                    params: this.queryInfo,
                });
                if (res.meta.status !== 200) {
                    return this.$message.error("获取商品列表失败");
                }
                this.$message.success("获取商品列表成功");
                this.goodsList = res.data.goods;
                this.total = res.data.total;

            },
            handleSizeChange(size) {
                this.queryInfo.pagesize = size;
                this.getGoodsList();
            },
            handleCurrentChange(page) {
                this.queryInfo.pagenum = page;
                this.getGoodsList();
            },
            async deleteGoodById(id){
                const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?',
                    '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning',
                        closeOnClickModal: false,
                    }).catch(err => {
                    return err;
                });
                if (confirmResult !== "confirm") {
                    return this.$message.info("已取消删除")
                }
                const {data:res} = await this.$http.delete("goods/" + id);
                if (res.meta.status !== 200){
                    return this.$message.error("删除商品失败");
                }
                this.$message.success("删除商品成功");
                this.getGoodsList();
            },
            // 跳转到添加商品的页面
            goAddPage(){
                // 跳转到指定的url
                this.$router.push("/goods/add");
            },
        },

        created() {
            this.getGoodsList();
        }
    }
</script>

<style scoped>

</style>
