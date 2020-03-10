<template>
    <div>
        <!--面包屑-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{path: '/home'}">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
        <!--卡片-->
        <el-card>
            <!-- 添加分类的按钮区 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
                </el-col>
            </el-row>

            <!-- 商品分类列表区 -->
            <!--<el-table border stripe :data="cateList">-->
            <!--    <el-table-column type="index" label="序号"></el-table-column>-->
            <!--</el-table>-->
            <tree-table class="treeTable"
                        :data="cateList"
                        :columns="columns"
                        :selection-type="false"
                        :expand-type="false"
                        show-index
                        index-text="序号"
                        border>
                <!-- 是否有效的模板 -->
                <template v-slot:isok="scope">
                    <i class="el-icon-success isDeleteIcon" v-if="!scope.row.cat_deleted"></i>
                    <!-- 注意else的使用 -->
                    <i class="el-icon-error isDeleteIcon" v-else></i>
                </template>

                <!-- 排序的模板 -->
                <template v-slot:order="scope">
                    <el-tag size="mini"
                            v-if="scope.row.cat_level === 0">一级
                    </el-tag>
                    <el-tag type="success"
                            size="mini"
                            v-else-if="scope.row.cat_level === 1">二级
                    </el-tag>
                    <el-tag type="warning"
                            size="mini"
                            v-else>三级
                    </el-tag>
                </template>

                <!-- 操作的模板 -->
                <template v-slot:opt="scope">
                    <el-button type="primary"
                               size="mini"
                               icon="el-icon-edit"
                               @click="showEditCateDialog(scope.row.cat_id)">编辑
                    </el-button>
                    <el-button type="danger"
                               size="mini"
                               icon="el-icon-delete"
                               @click="removeCateById(scope.row.cat_id)">删除
                    </el-button>
                </template>
            </tree-table>

            <!-- 分页区 -->
            <!-- current-page绑定到当前页 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[3, 5, 10, 15]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>
        </el-card>

        <!-- 添加分类的对话框 -->
        <el-dialog
            title="添加分类"
            :visible.sync="addCateDialogVisible"
            width="50%"
            :close-on-click-modal="false"
            @close="addCateDialogClosed">
            <!-- 添加分类的表单 -->
            <el-form :model="addCateForm"
                     :rules="addCateFormRules"
                     ref="addCateFormRef"
                     label-width="100px">
                <!-- prop是验证规则 -->
                <el-form-item label="分类名称：" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <!-- 父级分类是下拉菜单选择，所以不需要有验证规则 -->
                <el-form-item label="父级分类：">
                    <!-- 级联选择器有高度溢出的问题，高度必须在global中定义。 -->
                    <el-cascader
                        clearable
                        v-model="selectedParentKeys"
                        :options="parentCateList"
                        :props="cascaderProps"
                        @change="parentCateChanged">
                    </el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 编辑分类的对话框 -->
        <el-dialog
            title="编辑分类"
            :visible.sync="editCateDialogVisible"
            width="50%">
            <el-form ref="editCateFormRef"
                     :model="editCateForm"
                     :rules="editCateFormRules"
                     label-width="80px">
                <el-form-item label="分类名称">
                    <el-input v-model="editCateForm.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <el-button @click="editCateDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editCate">确 定</el-button>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "Cate",
        data() {
            return {
                // 查询条件(获取分类列表的的参数)
                queryInfo: {
                    type: 3,
                    pagenum: 1,
                    pagesize: 5,
                },
                // 商品分类的数据列表
                cateList: [],
                // 总分类个数
                total: 0,
                columns: [
                    {
                        label: "分类名称",
                        prop: "cat_name"
                    },
                    {
                        label: "是否有效",
                        // 表示当前列为模板列
                        type: "template",
                        // 表示当前列使用的模板名称
                        template: "isok",
                    },
                    {
                        label: "排序",
                        type: "template",
                        template: "order"
                    },
                    {
                        label: "操作",
                        type: "template",
                        template: "opt"
                    },
                ],
                // 添加分类对话框的显示状态
                addCateDialogVisible: false,

                // 用于保存“添加分类”对话框中的表单的数据
                addCateForm: {
                    // 分类名称
                    cat_name: "",
                    // 父级分类的ID
                    cat_pid: 0,
                    // 分类层级
                    cat_level: 0,
                },
                // 添加分类表单的验证规则对象
                addCateFormRules: {
                    cat_name: [
                        {required: true, message: "请输入分类名称", trigger: "blur"},
                    ]
                },
                // 编辑分类表单的验证规则对象
                editCateFormRules: {
                    cat_name: [
                        {required: true, message: "请输入分类名称", trigger: "blur"},
                    ]
                },
                // 父级分类的列表（用于添加分类对话框中，父级分类下拉菜单的显示）
                parentCateList: [],
                // 级联选择器的配置对象
                cascaderProps: {
                    expandTrigger: 'hover',
                    label: 'cat_name',
                    value: 'cat_id',
                    children: 'children',
                    // 是否可以选择任意一级的选项
                    checkStrictly: true,
                },
                // 级联选择器选择的对象数据
                selectedParentKeys: [],

                // 编辑分类对话框的显示是否
                editCateDialogVisible: false,

                editCateForm: {
                    // 分类名称
                    cat_name: "",
                    cat_id: "",
                },
            }
        },

        created() {
            this.getCateList();
        },
        methods: {
            // 获取商品分类
            async getCateList() {
                // TODO：这里的参数对象的属性为什么是params?可不可以随便写？
                const {data: res} = await this.$http.get("categories", {params: this.queryInfo})
                if (res.meta.status !== 200) {
                    return this.$message.error("获取商品分类数据失败");
                }
                // 一定要注意接口文档，这个接口的数据存在result中，并不是data
                this.cateList = res.data.result;
                this.total = res.data.total;
            },
            // 监听pageSize改变的事件
            handleSizeChange(newPageSize) {
                // 一旦pageSize发生变化，则需要把新的pageSize赋值给queryInfo中，然后重新刷新分类列表。
                this.queryInfo.pagesize = newPageSize;
                this.getCateList();
            },
            // 监听pageNum改变的事件
            handleCurrentChange(newPageNum) {
                this.queryInfo.pagenum = newPageNum;
                this.getCateList();
            },
            // 点击按钮显示添加分类的对话框
            showAddCateDialog() {
                // 获取父级分类的数据列表
                this.getParentCateList();
                this.addCateDialogVisible = true;
            },
            // 获取父级分类的数据列表（用于添加分类对话框中父级分类下拉选择框的数据展示）
            async getParentCateList() {
                const {data: res} = await this.$http.get("categories", {
                    params: {
                        type: 2,
                    }
                });
                if (res.meta.status !== 200) {
                    return this.$message.error("获取父级列表数据失败");
                }
                this.parentCateList = res.data;
            },
            // 添加分类对话框中，选择项发成变化后，触发下面的方法
            parentCateChanged() {
                // 判断selectedParentKeys数组的length：
                // 1 - 如果为0，代表没有选择任何父级节点
                // 2 - 如果为1，代表选中了一级父级节点，那么准备添加的分类，就是二级分类
                // 3 - 如果为2，代表选中了二级父级节点，那么准备添加的分类，就是三级分类
                // 以上是判断的逻辑，但实际代码的逻辑可以再简单一些：
                // 1 - 如果length>0，那么说明选中了父级节点，数组中最后一个元素就是父节点ID。
                // 2 - 如果length=0，那么说明没有选择任何父级节点，要创建的分类就是第一级分类。

                // API文档：
                // cat_pid	    分类父ID	    不能为空，如果要添加1级分类，则父分类Id应该设置为 0
                // cat_name	    分类名称	    不能为空
                // cat_level	分类层级	    不能为空，0表示一级分类；1表示二级分类；2表示三级分类
                if (this.selectedParentKeys.length > 0) {
                    // 父级分类的pid是最后一个元素的id
                    this.addCateForm.cat_pid = this.selectedParentKeys[this.selectedParentKeys.length - 1];
                    // 新添加分类的层级就是父级元素个数+1（length）
                    this.addCateForm.cat_level = this.selectedParentKeys.length;
                    return;
                } else {
                    // 如果进入else分支，说明没有父级节点，那么其父节点的ID就设置为0，自身的层级也是0。
                    this.addCateForm.cat_pid = 0;
                    this.addCateForm.cat_level = 0;
                }
            },
            // 添加分类表单的提交按钮监听事件
            addCate() {
                this.$refs.addCateFormRef.validate(async (valid) => {
                    if (!valid) {
                        return;
                    }
                    const {data: res} = await this.$http.post("categories", this.addCateForm)
                    if (res.meta.status !== 201) {
                        return this.$message.error("添加分类失败");
                    }
                    this.$message.success("添加分类成功");
                    this.getCateList();
                    this.addCateDialogVisible = false;
                })
            },

            // 监听添加分类对话框的关闭事件，清空对话框表单的内容(重置表单)
            addCateDialogClosed() {
                // 清空表单数据（不包括下面的级联选择器）
                this.$refs.addCateFormRef.resetFields();
                // 清空级联选择器绑定的数组
                this.selectedParentKeys = [];
                // 级联选择器绑定的parentCateChange()方法中，同时修改了addCateForm对象的属性，这里也需要清空。
                this.addCateForm.cat_pid = 0;
                this.addCateForm.cat_level = 0;
                // cat_name可以不清空，因为cat_name字段和表单的input是双向绑定的，
                // 上面做resetFields的时候，这个字段就清空了。而cat_pid和cat_level的值，
                // 是级联选择器的方法赋值的，所以要单独而重置。
                // this.addCateForm.cat_name = "";
            },
            // 打开编辑分类的页面
            async showEditCateDialog(id) {
                this.editCateForm.cate_id = id;
                const {data: res} = await this.$http.get("categories/" + id);
                if (res.meta.status !== 200) {
                    return this.$message.error("获取分类失败");
                }
                this.editCateForm = res.data;
                this.editCateDialogVisible = true;
            },

            // 提交编辑分类的表单事件
            editCate() {
                this.$refs.editCateFormRef.validate(async (valid) => {
                    if (!valid) {
                        return;
                    }
                    const {data: res} = await this.$http.put("categories/" + this.editCateForm.cat_id,
                        {cat_name: this.editCateForm.cat_name});
                    if (res.meta.status !== 200) {
                        return this.$message.error("修改分类失败");
                    }
                    this.$message.success("修改分类成功");
                    this.editCateDialogVisible = false;
                    this.getCateList();
                })
            },

            // 删除分类
            async removeCateById(id) {
                // 需要判断分类是否有子节点，如果有的话，不能删除，需要从子节点开始一步一步向上删除。
                const confirmResult = await this.$confirm("此操作将永久删除该分类，是否继续？",
                    "提示", {
                        confirmButtonText: "确定",
                        cancelButtonText: "取消",
                        type: "warning",
                        closeOnClickModal: false,
                    })
                    .catch(err => {
                        return err;
                    });
                if (confirmResult !== "confirm") {
                    return this.$message.info("已取消删除");
                }
                // 删除分类
                const {data: res} = await this.$http.delete("categories/" + id);
                if (res.meta.status !== 200){
                    return this.$message.error("删除分类失败");
                }
                this.$message.success("删除分类成功");
                this.getCateList();
            },
        },
    }
</script>

<style scoped>
    .isDeleteIcon {
        color: lightgreen;
    }

    .treeTable {
        margin-top: 15px;
    }

    .el-cascader {
        width: 100%;
    }

</style>
