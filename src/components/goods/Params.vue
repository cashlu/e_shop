<template>
    <div>
        <!--面包屑-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{path: '/home'}">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片 -->
        <el-card>
            <!-- 头部警告区 -->
            <el-alert
                title="注意：只允许为第三级分类设置相关参数！"
                type="warning"
                :closable="false"
                show-icon>
            </el-alert>

            <!-- 选择商品分类区 -->
            <el-row class="cat_opt">
                <el-col>
                    <span>选择商品分类：</span>
                    <!-- 选择分类的级联选择器 -->
                    <el-cascader
                        v-model="selectedCateKeys"
                        :options="cateList"
                        :props="cateProps"
                        @change="handleChange">
                    </el-cascader>
                </el-col>
            </el-row>
            <!-- 标签页区域 -->
            <el-tabs v-model="activeName" @tab-click="handleClick">
                <!-- 动态参数面板 -->
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary"
                               size="mini"
                               :disabled="isBtnDisabled"
                               @click="addDialogVisible=true">添加参数
                    </el-button>

                    <!-- 动态参数的表格-->
                    <el-table :data="manyTableData"
                              border
                              stripe>
                        <!-- 展开行 -->
                        <el-table-column type="expand">
                            <template v-slot="scope">
                                <!-- 循环渲染tag标签 -->
                                <el-tag v-for="(item, i) in scope.row.attr_vals"
                                        :key="i"
                                        :closable="true"
                                        @close="handleClose(i, scope.row)">
                                    {{item}}
                                </el-tag>
                                <!-- 新增Tag的input和button -->
                                <!-- input和button切换显示 -->
                                <el-input
                                    class="input-new-tag"
                                    v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button class="button-new-tag" v-else size="small" @click="showInput(scope.row)">+
                                    New Tag
                                </el-button>
                            </template>
                        </el-table-column>
                        <!-- 索引列 -->
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template v-slot="scope">
                                <!-- 如果要使用作用域插槽的话，那么使用的元素必须包裹在template中。 -->
                                <el-button size="mini"
                                           type="primary"
                                           @click="showEditDialog(scope.row.attr_id)"
                                           icon="el-icon-edit">编辑
                                </el-button>
                                <el-button size="mini"
                                           type="danger"
                                           @click="removeParamById(scope.row.attr_id)"
                                           icon="el-icon-delete">删除
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <!-- 静态属性面板 -->
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary"
                               size="mini"
                               :disabled="isBtnDisabled"
                               @click="addDialogVisible=true">添加属性
                    </el-button>

                    <!-- 静态属性的表格 -->
                    <el-table :data="onlyTableData"
                              border
                              stripe>
                        <!-- 展开行 -->
                        <el-table-column type="expand">
                            <template v-slot="scope">
                                <!-- 循环渲染tag标签 -->
                                <el-tag v-for="(item, i) in scope.row.attr_vals"
                                        :key="i"
                                        :closable="true"
                                        @close="handleClose(i, scope.row)">
                                    {{item}}
                                </el-tag>
                                <!-- 新增Tag的input和button -->
                                <!-- input和button切换显示 -->
                                <el-input
                                    class="input-new-tag"
                                    v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button class="button-new-tag" v-else size="small" @click="showInput(scope.row)">+
                                    New Tag
                                </el-button>
                            </template>
                        </el-table-column>
                        <!-- 索引列 -->
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template v-slot="scope">
                                <el-button size="mini"
                                           type="primary"
                                           @click="showEditDialog(scope.row.attr_id)"
                                           icon="el-icon-edit">编辑
                                </el-button>
                                <el-button size="mini"
                                           type="danger"

                                           @click="removeParamById(scope.row.attr_id)"
                                           icon="el-icon-delete">删除
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>


        <!-- 添加参数的对话框 -->
        <el-dialog :title="'添加' + titleText + ':'"
                   :visible.sync="addDialogVisible"
                   width="50%"
                   :close-on-click-modal="false"
                   @close="addDialogClosed">
            <el-form :model="addForm"
                     :rules="addFormRules"
                     ref="addFormRef"
                     label-width="130px">
                <el-form-item :label="'添加' + titleText + ':'" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                 <el-button @click="addDialogVisible = false">取 消</el-button>
                 <el-button type="primary" @click="addParams">确 定</el-button>
             </span>
        </el-dialog>

        <!-- 修改参数的对话框 -->
        <el-dialog :title="'修改' + titleText + ':'"
                   :visible.sync="editDialogVisible"
                   width="50%"
                   :close-on-click-modal="false"
                   @close="editDialogClosed">
            <el-form :model="editForm"
                     :rules="editFormRules"
                     ref="editFormRef"
                     label-width="130px">
                <el-form-item :label="'修改' + titleText + ':'" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                 <el-button @click="editDialogVisible = false">取 消</el-button>
                 <el-button type="primary" @click="editParams">确 定</el-button>
             </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "Params",
        data() {
            return {
                // 商品分类列表
                cateList: [],
                // 级联选择器的props
                cateProps: {
                    expandTrigger: 'hover',
                    label: "cat_name",
                    value: "cat_id",
                    children: "children",
                },
                // 被选中的分类数组
                selectedCateKeys: [],
                // Tabs的激活页
                activeName: "many",
                // 动态参数表的数据
                manyTableData: [],
                // 静态属性表的数据
                onlyTableData: [],
                // 添加参数（属性）对话框的展示与否
                addDialogVisible: false,
                // 添加参数（属性）对话框表单对应的对象
                addForm: {},
                // 添加表单的验证规则对象
                addFormRules: {
                    attr_name: [
                        {required: true, message: "请输入参数名称", trigger: "blur"},
                    ]
                },
                // 修改参数的对话框的显示与否
                editDialogVisible: false,
                // 编辑参数表单对应的对象
                editForm: {},
                // 编辑参数表单的验证规则
                editFormRules: {
                    attr_name: [
                        {required: true, message: "请输入参数名称", trigger: "blur"},
                    ]
                },

            }
        },
        created() {
            this.getCateList();
        },
        methods: {
            // 获取所有的商品分类
            async getCateList() {
                const {data: res} = await this.$http.get("categories/");
                if (res.meta.status !== 200) {
                    return this.$message.error("获取商品列表失败");
                }
                this.cateList = res.data;
            },
            // 获取参数的列表数据
            async getParamsData() {
                // 这个功能默认只能选中三级分类，那么就要判断一下，只允许选中三级分类。
                // 这个功能貌似最新版级联选择器默认的行为是只能选择最后一级。所以这里不是必须的。
                if (this.selectedCateKeys.length !== 3) {
                    this.selectedCateKeys = [];
                    // 同时把下面的表格也要清空，因为之前选择了三级分类，下方显示了参数数据，
                    // 而后又点击了一个二级分类，如果不清空的话，下方的表格中还会显示之前的数据。
                    this.manyTableData = [];
                    this.onlyTableData = [];
                    return;
                }
                // 选择了三级分类，那么根据当前所选择的分类ID和所处的面板，获取对应的请求参数
                const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
                    params: {sel: this.activeName}
                });
                if (res.meta.status !== 200) {
                    return this.$message.error("请求参数列表失败");
                }

                // 获取分项的数据
                // 分项的数据attr_vals是后端返回的一个字符串，用空格分隔每一项。
                res.data.forEach((item) => {
                    // 这里需要判断一下attr_vals是否为空，否则空数据分割后，会得到有一个空字符串的数组。
                    item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
                    // 添加一个自己单独的boolean值，来控制添加tag功能的input和button的切换显示。
                    item.inputVisible = false;
                    // 添加一个自己单独的string值，来保存添加tag功能中，input的值。
                    item.inputValue = "";
                });


                if (this.activeName === "many") {
                    this.manyTableData = res.data;
                } else {
                    this.onlyTableData = res.data;
                }
            },
            // 级联选择器选择项变化的监听事件
            handleChange() {
                this.getParamsData();
            },
            // Tabs的点击事件处理函数
            handleClick() {
                this.getParamsData();
            },
            // 添加参数对话框关闭时重置表单的内容
            addDialogClosed() {
                this.$refs.addFormRef.resetFields();
            },
            // 添加参数或属性
            addParams() {
                this.$refs.addFormRef.validate(async (valid) => {
                    if (!valid) return;
                    const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`, {
                        // 参数的值存在表单对应的addFrom对象中。
                        attr_name: this.addForm.attr_name,
                        // 激活页的名称，也有属性在存储。
                        attr_sel: this.activeName,
                    });
                    if (res.meta.status !== 201) {
                        return this.$message.error("添加参数失败");
                    }
                    this.$message.success("添加参数成功");
                    this.addDialogVisible = false;
                    this.getParamsData();
                })

            },
            // 修改参数的对话框的显示
            async showEditDialog(attrId) {
                this.editDialogVisible = true;
                // 查询到当前正在修改的参数信息
                const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, {
                    params: {attr_sel: this.activeName}
                });
                if (res.meta.status !== 200) {
                    return this.$message.error("获取参数信息失败");
                }
                this.editForm = res.data;
            },
            editDialogClosed() {
                this.$refs.editFormRef.resetFields();
            },
            // 修改参数的提交按钮事件，向后端发起修改的请求。
            editParams() {
                // 但凡提交表单，都要先做表单的预校验
                this.$refs.editFormRef.validate(async (valid) => {
                    if (!valid) return;
                    const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
                        attr_name: this.editForm.attr_name,
                        attr_sel: this.activeName,
                    });
                    if (res.meta.status !== 200) {
                        return this.$message.error("修改参数失败");
                    }
                    this.$message.success("修改参数成功");
                    this.getParamsData();
                    this.editDialogVisible = false;
                });
            },
            async removeParamById(attrId) {
                const confirmResult = await this.$confirm("此操作将永久删除该参数，是否继续？",
                    "提示", {
                        confirmButtonText: "确定",
                        cancelButtonText: "取消",
                        type: "warning",
                        closeOnClickModal: false,
                    })
                    .catch((err) => {
                        return err;
                    });
                if (confirmResult !== "confirm") {
                    return this.$message.info("已取消删除")
                } else {
                    const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
                    if (res.meta.status !== 200) {
                        return this.$message.error("参数删除失败");
                    }
                    this.$message.success("参数删除成功");
                    this.getParamsData();
                }
            },
            // 新增tag的input失去焦点或者keyup enter键的处理函数
            async handleInputConfirm(row) {
                // 将inputValue前后的空格去掉，如果长度为0，代表用户输入的只有空格，或者什么都没有输入。
                if (row.inputValue.trim().length === 0) {
                    row.inputValue = "";
                    row.inputVisible = false;
                    return;
                }
                // 如果有合法输入，需要处理输入的数据。
                // 将用户的输入去掉前后的空格，然后推入attr_vals数组中。
                row.attr_vals.push(row.inputValue.trim());
                // 清空inputValue
                row.inputValue = "";
                row.inputVisible = false;
                // 向后端发起请求，保存添加的属性
                this.saveAttrVals(row);
                // const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,
                //     {
                //         attr_name: row.attr_name,
                //         attr_sel: row.attr_sel,
                //         attr_vals: row.attr_vals.join(" "),
                //     });
                // if (res.meta.status !== 200) {
                //     return this.$message.error("添加参数失败");
                // }
                // this.$message.success("添加参数成功");
            },
            // 将对attr_vals的操作提交给后端。
            async saveAttrVals(row) {
                const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,
                    {
                        attr_name: row.attr_name,
                        attr_sel: row.attr_sel,
                        attr_vals: row.attr_vals.join(" "),
                    });
                if (res.meta.status !== 200) {
                    return this.$message.error("添加参数失败");
                }
                this.$message.success("添加参数成功");
            },
            // 新增tag按钮的处理函数，切换input和button的显示与否
            // 这里的处理方式要注意，因为要分开控制每一项，所以在模板中，将scope.row作为参数传递过来，
            // 这里接收了这个参数。每一个scope.row代表一个param对象。
            showInput(row) {
                row.inputVisible = true;
                // 让文本框自动获得焦点
                // $nextTick()的作用是在页面被重新渲染之后，再调用回调函数。
                this.$nextTick(_ => {
                    this.$refs.saveTagInput.$refs.input.focus();
                });
            },
            // tag的关闭事件，用于删除tag
            // 这里不但需要row，同时还需要tag在数组中的索引
            handleClose(index, row) {
                // splice()方法会改变原数组，所以这里直接使用就可以。
                row.attr_vals.splice(index, 1);
                this.saveAttrVals(row);
            }
        },
        computed: {
            // 如果按钮需要被禁用，则返回true，否则返回false
            isBtnDisabled() {
                return this.selectedCateKeys.length !== 3;
            },
            // 当前选中的三级分类的ID
            cateId() {
                if (this.selectedCateKeys.length === 3) {
                    return this.selectedCateKeys[2];
                }
                return null;
            },
            titleText() {
                // 动态计算标题的文本
                // 根据激活的面板，来确定标题的文字
                if (this.activeName === "many") {
                    return "动态参数"
                } else {
                    return "静态属性"
                }
            }
        }

    }
</script>

<style scoped>
    .cat_opt {
        margin-top: 15px;
    }

    .el-tag {
        margin: 10px 15px 0 0;
    }

    .input-new-tag {
        width: 150px;
    }

    .button-new-tag {
        margin: 10px 0 0 0;
    }
</style>
