<template>
    <div>
        <!-- 面包屑 -->
        <!-- 面包屑的margin设置在global.css中，因为这个设置在所有的地方都要使用，
        所以没有定义在这个component中。 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>权限列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <el-table
                :data="rightList"
                border
                stripe>
                <!-- 索引列 -->
                <el-table-column type="index" label="序号"></el-table-column>
                <!-- 数据列 -->
                <!--<el-table-column label="ID" prop="id"></el-table-column>-->
                <el-table-column label="权限名称" prop="authName"></el-table-column>
                <el-table-column label="路径" prop="path"></el-table-column>
                <el-table-column label="权限等级" prop="level">
                    <template v-slot="scope">
                        <el-tag
                            v-if="scope.row.level === '0'">
                            一级权限
                        </el-tag>
                        <el-tag type="success" v-if="scope.row.level === '1'">二级权限</el-tag>
                        <el-tag type="warning" v-if="scope.row.level === '2'">三级权限</el-tag>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script>
    export default {
        name: "Right",
        data() {
            return {
                rightList: [],

            }
        },
        created() {
            this.getRightList();
        },
        methods: {
            async getRightList() {
                const {data: res} = await this.$http.get("rights/list");
                if (res.meta.status !== 200) {
                    return this.$message.error("权限列表获取失败");
                }
                this.rightList = res.data;
                console.log(this.rightList);
            }
        }
    }
</script>

<style scoped>

</style>
