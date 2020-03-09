<template>
    <div>
        <!--面包屑-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{path: '/home'}">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!--卡片-->
        <el-card>
            <!-- 用一个独立的行和列，来放置button组件 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
                </el-col>
            </el-row>
            <!--  角色列表区  -->
            <el-table :data="roleList" border stripe>
                <!-- 展开按钮（箭头）列 -->
                <el-table-column type="expand">
                    <template v-slot="scope">
                        <!-- 栅格系统来实现吗页面布局 -->
                        <!-- TODO: key的作用是什么？-->
                        <el-row :class="['bdbottom', i1===0?'bdtop':'', 'vcenter']"
                                v-for="(item1, i1) in scope.row.children"
                                :key="item1.id">
                            <!-- 渲染一级权限 -->
                            <el-col :span="5">
                                <el-tag @close="removeRightById(scope.row, item1.id)"
                                        closable>
                                    {{item1.authName}}
                                </el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 渲染二级、三级权限 -->
                            <el-col :span="19">
                                <!-- 通过for循环，嵌套渲染二级权限 -->
                                <el-row :class="[i2 === 0?'': 'bdtop', 'vcenter']"
                                        v-for="(item2, i2) in item1.children"
                                        :key="item2.id">
                                    <el-col :span="6">
                                        <el-tag type="success"
                                                @close="removeRightById(scope.row, item2.id)"
                                                closable>
                                            {{item2.authName}}
                                        </el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <!-- 第一个参数传回的是scope.row，而非scope.row.id，因为row是一个role，在删除逻辑的方法中，
                                        我们需要使用到role来重新刷新页面。 -->
                                        <el-tag type="warning"
                                                @close="removeRightById(scope.row, item3.id)"
                                                closable
                                                v-for="(item3) in item2.children"
                                                :key="item3.id">
                                            {{item3.authName}}
                                        </el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index" label="序号"></el-table-column>
                <!-- 数据列 -->
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <!-- 规定这一列的宽度为固定值，这样页面无论怎么缩放，里面的三个按钮都会在一行显示 -->
                <el-table-column label="操作" width="300px">
                    <template v-slot="scope">
                        <el-button size="mini"
                                   type="primary"
                                   icon="el-icon-edit"
                                   @click="showEditDialog(scope.row.id)">
                            编辑
                        </el-button>
                        <el-button size="mini"
                                   type="danger"
                                   icon="el-icon-delete">
                            删除
                        </el-button>
                        <el-button size="mini"
                                   type="warning"
                                   icon="el-icon-setting"
                                   @click="showSetRightDialog(scope.row)">
                            分配权限
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!-- 添加角色对话框 -->
        <el-dialog @close="addDialogClose"
                   :close-on-click-modal="false"
                   :visible.sync="addDialogVisible"
                   title="添加角色"
                   width="70%">
            <el-form ref="addFormRef"
                     label-width="100px"
                     :rules="addFormRules"
                     :model="addForm">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addRole">确 定</el-button>
            </span>
        </el-dialog>

        <!--  修改角色对话框  -->
        <el-dialog :visible.sync="editDialogVisible"
                   title="修改权限"
                   width="70%"
                   :close-on-click-modal="false"
                   @clise="editDialogClose">
            <!--  修改权限对话框的内容主体区域  -->
            <el-form label-width="100px"
                     ref="editFormRef"
                     :rules="editFormRules"
                     :model="editForm">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="editForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="editForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editRole">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 分配权限对话框 -->
        <el-dialog
            title="分配权限"
            :visible.sync="setRightDialogVisible"
            width="50%"
            @close="setRightDialogClosed">
            <!-- 树形结构控件 -->
            <!-- node-key="id"代表选中的节点，实际上是选中了该节点的ID -->
            <el-tree :data="rightList"
                     :props="treeProps"
                     show-checkbox node-key="id"
                     default-expand-all
                     check-on-click-node
                     :default-checked-keys="defKeys"
                     ref="treeRef">
            </el-tree>

            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary"
                           @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "Roles",
        data() {
            return {
                roleList: [],
                // 控制“添加角色”对话框的显示与否
                addDialogVisible: false,
                // 添加角色的表单数据
                addForm: {
                    roleName: "",
                    roleDesc: "",
                },
                addFormRules: {
                    roleName: [
                        {required: true, message: "请输入角色名称", trigger: "blur"},
                    ],
                    roleDesc: [
                        {required: true, message: "请输入简短的角色描述信息", trigger: "blur"},
                    ],
                },
                editForm: {},
                editDialogVisible: false,
                editFormRules: {
                    roleName: [
                        {required: true, message: "请输入角色名称", trigger: "blur"},
                    ],
                    roleDesc: [
                        {required: true, message: "请输入简短的角色描述信息", trigger: "blur"},
                    ],
                },
                setRightDialogVisible: false,
                // 所有权限的数组
                rightList: [],
                // 树形控件的属性绑定对象
                treeProps: {
                    children: 'children',
                    label: 'authName'
                },

                // 默认选中的节点的ID值数组
                defKeys: [],

                // 当前修改权限的角色的ID
                roleId: "",
            }
        },
        created() {
            this.getRoleList();
        },
        methods: {
            async "getRoleList"() {
                const {data: res} = await this.$http.get("roles");
                if (res.meta.status !== 200) {
                    return this.$message.error("获取角色列表失败");
                }
                this.roleList = res.data;
                // console.log(this.roleList);
            },
            // 添加权限
            "addRole": async function () {
                const {data: res} = await this.$http.post("roles", this.addForm);
                if (res.meta.status !== 201) {
                    this.$message.error("角色添加失败");
                }
                this.$message.success("角色添加成功");
                this.addDialogVisible = false;
                this.getRoleList();
            },
            "addDialogClose"() {
                this.$refs.addFormRef.resetFields();
            },
            // 修改权限对话框的数据获取
            "showEditDialog": async function (id) {
                this.editDialogVisible = true;
                const {data: res} = await this.$http.get("roles/" + id)
                if (res.meta.status !== 200) {
                    return this.$message.error("获取数据失败")
                }
                this.editForm = res.data;
            },
            async "editRole"() {
                // TODO: 千万注意url参数对应的字段名称。例如这里是roleId而不是id。
                const {data: res} = await this.$http.put("roles/" + this.editForm.roleId, {
                    "roleName": this.editForm.roleName,
                    "roleDesc": this.editForm.roleDesc,
                });
                if (res.meta.status !== 200) {
                    return this.$message.error("角色信息更新失败");
                }
                this.editDialogVisible = false;
                this.getRoleList();
                this.$message.success("角色信息更新成功");
            },
            "editDialogClose"() {
                // 因为每次打开对话框时，都是从后端请求的数据，所以这个方法可以不需要。
                this.$refs.editFormRef.resetFields();
            },
            // 通过权限ID删除权限
            async "removeRightById"(role, rightId) {
                //   // 弹框提示用户是否要删除
                const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '删除权限', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err);   // 直接返回err
                if (confirmResult !== 'confirm') {    // confirmResult有cancel和confirm两种值
                    return this.$message.info("取消了删除")
                }
                const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`);
                if (res.meta.status !== 200) {
                    return this.$message.error("删除权限失败");
                }
                this.$message.success("删除权限成功");

                // 刷新权限列表，但是不建议调用getRoleList()函数，因为这个函数会刷新整个页面，那么打开的下拉界面会关闭。
                // 这里要的效果是，刷新修改的这个role的权限列表，能实时的刷新，但是不要刷新整个页面。因为Delete操作后，接口会
                // 返回这个role最新的权限列表，那么简单的办法就是，用这个返回的列表，给role.children重新赋值即可。这里利用了
                // Vue的响应式的特性。
                // this.getRoleList();
                role.children = res.data;
            },
            // 显示分配权限的对话框
            async showSetRightDialog(role) {    // 这里的形参role，完全为getLeafKeys()服务
                // 首先获取所有权限数据(树状结构的权限，有3级)
                this.roleId = role.id;
                const {data: res} = await this.$http.get("rights/tree");
                if (res.meta.status !== 200) {
                    return this.$message.error("获取权限列表失败");
                }
                this.rightList = res.data;
                // console.log(this.rightList);
                // 在打开对话框之前，先通过递归获取角色已有的所有权限
                this.getLeafKeys(role, this.defKeys);


                // 打开权限分配的对话框
                this.setRightDialogVisible = true;
            },

            // 通过递归的方式，将角色的所有三级权限的id保存在数组defKeys中。
            getLeafKeys(node, arr) {
                if (!node.children) {
                    return arr.push(node.id);
                }
                node.children.forEach((item) => {
                    this.getLeafKeys(item, arr);
                })
            },
            // 监听分配权限对话框的关闭事件
            // 每次关闭对话框的时候，都清空rightList数组。因为每次打开对话框的时候，都好查询该role的所有权限，
            // 并写入到数组中，如果不清空的，下次换一个role打开分配权限的对话框，数组里面还保存有之前的数据。
            setRightDialogClosed() {
                this.defKeys = [];
            },
            // 分配权限对话框的确定按钮点击事件，提取所有已经勾选的权限，向后台发送请求，分配权限。
            async allotRights() {
                const keys = [
                    // "..." 是展开运算符。
                    ...this.$refs.treeRef.getCheckedKeys(),
                    ...this.$refs.treeRef.getHalfCheckedKeys(),
                ];
                const idStr = keys.join(",");
                const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids: idStr})
                if (res.meta.status !== 200) return this.$message.error("分配权限失败");
                this.$message.success("分配权限成功");

                // 刷新权限列表
                this.getRoleList();

                // 关闭对话框
                this.setRightDialogVisible = false;
            }
        }
    }
</script>

<style lang="less" scoped>
    .el-tag {
        margin: 7px;
    }

    .bdtop {
        border-top: 1px solid #eeeeee;
    }

    .bdbottom {
        border-bottom: 1px solid #eeeeee;
    }

    .vcenter {
        display: flex;
        align-items: center;
    }
</style>
