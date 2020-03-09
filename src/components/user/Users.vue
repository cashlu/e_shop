<template>
    <div>
        <!-- 面包屑 -->
        <!-- 面包屑的margin设置在global.css中，因为这个设置在所有的地方都要使用，
        所以没有定义在这个component中。 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <!-- 搜索与添加区 -->
            <!-- 这里使用了layout布局 -->
            <el-row :gutter="20">
                <el-col :span="10">
                    <el-input placeholder="请输入内容"
                              clearable
                              v-model="queryInfo.query"
                              @clear="getUserList">    <!-- 监听change事件貌似也是可以的。 -->
                        <el-button slot="append" icon="el-icon-search" @click="searchUser"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <!-- 如果把代码写在行间的话，不支持一些符号，建议写在单独的方法中。 -->
                    <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row>
            <!-- 用户列表数据区 -->
            <el-table
                :data="userList"
                style="width: 100%"
                border
                stripe>
                <!-- 索引列 -->
                <el-table-column type="index" label="序号"></el-table-column>
                <!-- 数据列 -->
                <el-table-column
                    prop="username"
                    label="姓名">
                </el-table-column>
                <el-table-column
                    prop="email"
                    label="邮箱">
                </el-table-column>
                <el-table-column
                    prop="mobile"
                    label="电话">
                </el-table-column>
                <el-table-column
                    prop="role_name"
                    label="角色">
                </el-table-column>
                <!-- 操作按钮 -->
                <el-table-column
                    prop="mg_state"
                    label="状态">
                    <!--slot-scope是作用域插槽-->
                    <template v-slot="scope">
                        <el-switch
                            v-model="scope.row.mg_state"
                            active-color="#13ce66"
                            inactive-color="#ff4949"
                            @change="changeUserState(scope.row)">
                            <!-- switch双向绑定了scope.row.mg_state属性，这里把scope.row传给方法。 -->
                        </el-switch>
                    </template>
                </el-table-column>
                <el-table-column
                    label="操作" width="180px">
                    <template v-slot="scope">
                        <!-- 修改-->
                        <el-tooltip class="item"
                                    effect="dark"
                                    content="修改"
                                    placement="top"
                                    :enterable="false">
                            <el-button type="primary"
                                       icon="el-icon-edit"
                                       size="mini"
                                       @click="showEditDialog(scope.row.id)">
                            </el-button>
                        </el-tooltip>
                        <!-- 删除 -->
                        <el-tooltip class="item"
                                    effect="dark"
                                    content="删除"
                                    placement="top"
                                    :enterable="false">
                            <el-button type="danger"
                                       icon="el-icon-delete"
                                       size="mini"
                                       @click="removeUserById(scope.row.id)">
                            </el-button>
                        </el-tooltip>
                        <!-- 分配角色 -->
                        <el-tooltip class="item"
                                    effect="dark"
                                    content="分配角色"
                                    placement="top"
                                    :enterable="false">
                            <el-button type="warning"
                                       icon="el-icon-setting"
                                       size="mini"
                                       @click="setRole(scope.row)">
                            </el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!--  分页  -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[1, 2, 5, 10]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="this.total">
            </el-pagination>
        </el-card>

        <!-- 添加用户的对话框 -->
        <el-dialog
            @close="addDialogClosed"
            :close-on-click-modal="false"
            title="添加用户"
            :visible.sync="addDialogVisible"
            width="50%">
            <!-- 内容主体区域 -->
            <el-form :model="addForm"
                     :rules="addFormRules"
                     ref="addFormRef"
                     label-width="70px">
                <!--prop是验证规则的属性-->
                <!--prop的值必须与rules字段名称保持一致-->
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>

            </el-form>
            <!-- 底部按钮区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>

        <!--  修改用户的对话框  -->
        <!-- close事件重置表单，意义不在于重置数据，而是重置验证的提示信息。 -->
        <el-dialog
            @close="editDialogClosed"
            :close-on-click-modal="false"
            title="修改用户"
            :visible.sync="editDialogVisible"
            width="50%">
            <!-- 内容主体区域 -->
            <el-form :model="editForm"
                     :rules="editFormRules"
                     ref="editFormRef"
                     label-width="70px">
                <el-form-item label="用户名">
                    <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>
                <!-- prop属性用于校验规则的匹配，是定义在el-form-item上的！千万不要定义在input上！！！ -->
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="editForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部按钮区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUser">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 分配角色对话框 -->
        <el-dialog
            title="分配角色"
            :visible.sync="setRoleDialogVisible"
            width="50%"
            @close="setRoleDialogClosed">
            <div>
                <p>当前用户：{{userInfo.username}}</p>
                <p>当前角色：{{userInfo.role_name}}</p>
                <p>分配新角色：</p>
                <el-select v-model="selectedRoleId" placeholder="请选择">
                    <el-option
                        v-for="item in rolesList"
                        :key="item.id"
                        :label="item.roleName"
                        :value="item.id">
                    </el-option>
                </el-select>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRoleDialogVisible=false">取 消</el-button>
                <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: "Users",
        data() {
            // 定义自定义的表单校验规则。这一这些规则的方法写在return的外面。
            // 1 - 自定义校验的方法有三个参数，rule是校验规则，value是需要校验的值，callback是校验后的回调函数。
            // 2 - 先定义一个校验的正则表达式。
            // 3 - 如果校验通过，直接返回调用回调函数，如果校验不通过，调用回调函数，传入一个Error对象，里面是输出的错误信息。
            // 4 - 在校验对象addFormRule中加入自定义的校验规则。
            // 校验邮箱
            let checkEmail = (rule, value, callback) => {
                // 匹配email地址的正则表达式
                const regEmail = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
                if (regEmail.test(value)) {
                    return callback();
                }
                callback(new Error("请输入合法的邮箱地址"));
            };
            // 校验手机号
            let checkMobile = (rule, value, callback) => {
                // 匹配手机号的正则表达式
                const regMobile = /^(0086|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
                if (regMobile.test(value)) {
                    return callback();
                }
                return callback(new Error("请输入正确的手机号码"));
            };
            return {
                // 获取用户列表的参数
                queryInfo: {
                    // 搜索关键字
                    query: "",
                    // 当前页码
                    pagenum: 1,
                    // 当前每页显示的条目数
                    pagesize: 5,
                },
                userList: [],
                total: 0,
                // 对话框绑定的属性，用来控制对话框的显示和隐藏。
                addDialogVisible: false,
                // 添加用户的表单数据
                addForm: {
                    username: "",
                    password: "",
                    mobile: "",
                    email: "",
                },
                // 添加用户表单的验证对象
                addFormRules: {
                    username: [
                        {required: true, message: "请输入用户名", trigger: "blur"},
                        {min: 3, max: 10, message: "用户名的长度在3-10位之间", trigger: "blur"},
                    ],
                    password: [
                        {required: true, message: "请输入密码", trigger: "blur"},
                        {min: 6, max: 15, message: "密码的长度在6-15位之间", trigger: "blur"},
                    ],
                    email: [
                        {required: true, message: "请输入邮箱", trigger: "blur"},
                        // {min: 6, max: 30, message: "邮箱的长度在6-15位之间", trigger: "blur"},
                        {validator: checkEmail, trigger: "blur"},
                    ],
                    mobile: [
                        {required: true, message: "请输入手机号码", trigger: "blur"},
                        // {min: 11, max: 18, message: "手机号码的长度在11-18位之间", trigger: "blur"},
                        {validator: checkMobile, trigger: "blur"},
                    ],
                },
                // 修改用户表单的验证规则对象
                editFormRules: {
                    email: [
                        {required: true, message: "请输入邮箱", trigger: "blur"},
                        {validator: checkEmail, trigger: "blur"},
                    ],
                    mobile: [
                        {required: true, message: "请输入手机号码", trigger: "blur"},
                        {validator: checkMobile, trigger: "blur"},
                    ],
                },
                // 控制修改用户的对话框的显示与否
                editDialogVisible: false,
                // 用来保存用户信息，以便修改用户信息的功能来使用。
                editForm: {},

                // 设置角色对话框对话框的显示
                setRoleDialogVisible: false,

                // 在用户分配角色时，需要被操作的用户信息
                userInfo: {},

                // 所有角色的数据列表
                rolesList: [],

                // 分配角色时选中的角色ID
                selectedRoleId: "",
            }
        },
        created() {
            this.getUserList();
        },
        methods: {
            async getUserList() {
                const {data: res} = await this.$http("users", {
                    params: this.queryInfo,
                });
                // console.log(res);
                if (res.meta.status !== 200) {
                    return this.$message.error("获取用户列表失败")
                }
                this.userList = res.data.users;
                this.total = res.data.total;
            },

            // 监听pagesize改变的事件
            handleSizeChange(newSize) {
                // console.log(newSize);
                this.queryInfo.pagesize = newSize;
                // 修改了pagesize，需要重新发起请求，获取数据。
                this.getUserList();
            },

            // 监听页码值改变的事件
            handleCurrentChange(newPage) {
                // console.log(newPage);
                this.queryInfo.pagenum = newPage;
                this.getUserList();
            },

            // 监听switch开关状态的改变
            async changeUserState(userInfo) {
                // console.log(userInfo);
                // 下面的url是ES6的Template Strings模板字符串
                // 其中${}是占位符，里面的变量名，就是实际在这里替换的值。
                const {data: res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
                if (res.meta.status !== 200) {
                    // 请求失败，将修改的switch重置回去
                    userInfo.mg_state = !userInfo.mg_state;
                    return this.$message.error("更新用户状态失败!");
                }
                this.$message.success("更新成功！");
            },

            // 搜索功能
            searchUser() {
                // 如果不把页码重置回第一页，在其他页面搜索的时候，会搜索不到数据。
                this.queryInfo.pagenum = 1;
                this.getUserList();
            },

            // 监听添加用户对话框的关闭事件，关闭对话框重置表单。如果不清空表单，
            // 当表单填写一半然后关闭，再次打开后，表单内还有上次填写的内容。
            // 通过表单的$ref引用，调用resetFields()方法。
            addDialogClosed() {
                this.$refs.addFormRef.resetFields();
            },

            // 添加用户
            addUser() {
                // 先对表单进行预校验
                this.$refs.addFormRef.validate(async valid => {
                    if (!valid) return;
                    // 向服务器发起post请求，上传新建用户的数据，根据api文档，这里需要传的几个参数，
                    // 和我们之前定义的表单数据对象addForm对象的属性名称一样，那么我们可以直接把这个表单的数据对象传递过去。
                    // TODO：按照个人理解，Axios传递的是json数据，他内部自动的将对象转换为json格式了。
                    const {data: res} = await this.$http.post("users", this.addForm);
                    // console.log(res);
                    if (res.meta.status !== 201) {
                        this.$message.error("添加用户失败！");
                        // TODO: 这里有个问题，如果添加失败了呢？这个代码会继续往下走，这是一个BUG。
                    }
                    this.$message.success("添加用户成功！");
                    // 添加成功后，隐藏对话框。
                    this.addDialogVisible = false;
                    // 新增了用户，为了及时的体现出来，所以这里还要刷新一下用户列表。
                    this.getUserList();
                });


                // TODO: 这个方法如果改为then()的链式调用，会报错。
                // this.$refs.addFormRef.validate().then(function (valid) {
                //     console.log(valid);
                // })
            },

            // 修改用户数据页面的数据获取。
            async showEditDialog(id) {
                this.editDialogVisible = true;
                // console.log(id);
                const {data: res} = await this.$http.get("users/" + id);
                // console.log(res);
                if (res.meta.status !== 200) {
                    return this.$message.error("获取数据失败");
                }
                this.editForm = res.data;
                console.log(this.editForm);
            },

            // 实现方式2
            // showEditDialog(id) {
            //     this.editDialogVisible = true;
            //     // 这里要格外注意！
            //     // 因为axios不能获取到指向Vue实例的this，所以在这里要在执行axios.get()方法之前，先用一个变量把
            //     // this保存下来，以便后面使用。
            //     let _this = this;
            //     this.$http.get("users/" + id).then(function (res) {
            //         console.log(res.data);
            //         let data = res.data.data;
            //         let status = res.data.meta.status;
            //         console.log(status);
            //         if (status !== 200) {
            //             return _this.$message.error("获取数据失败");
            //         }
            //         _this.editForm = data;
            //         console.log(_this.editForm);
            //     })
            // }

            // 实现方式3
            // 如果不想使用async/await的语法，而是使用then()的话，那么为了避免this指向的问题，than()里面
            // 传递的函数最好是一个箭头函数，这样this指向的依旧是Vue实例。
            // 和上面的方案2一样，因为默认axios返回的是一个promise对象，所以要注意真实数据的嵌套层级。
            // showEditDialog(id) {
            //     this.editDialogVisible = true;
            //     // 这里要格外注意！
            //     // 因为axios不能获取到指向Vue实例的this，所以在这里要在执行axios.get()方法之前，先用一个变量把
            //     // this保存下来，以便后面使用。
            //     this.$http.get("users/" + id).then(res => {
            //         console.log(res.data);
            //         let data = res.data.data;
            //         let status = res.data.meta.status;
            //         console.log(status);
            //         if (status !== 200) {
            //             return this.$message.error("获取数据失败");
            //         }
            //         this.editForm = data;
            //         console.log(this.editForm);
            //     })
            // }

            editDialogClosed() {
                this.$refs.editFormRef.resetFields();
            },

            // 修改用户数据
            editUser() {
                // 对表单进行预验证
                this.$refs.editFormRef.validate(async valid => {
                    // console.log(valid);
                    if (!valid) return;
                    // 修改用户数据的表单，双向动态绑定了editForm对象，所以id从editForm取就可以了。
                    // console.log(this.editForm);
                    const {data: res} = await this.$http.put("users/" + this.editForm.id, {
                        email: this.editForm.email,
                        mobile: this.editForm.mobile,
                    });

                    if (res.meta.status !== 200) {
                        return this.$message.error("用户信息更新失败");
                    }
                    // 如果更新成功，则需要隐藏对话框，更新用户列表，弹出成功的提示。
                    this.editDialogVisible = false;
                    this.getUserList();
                    this.$message.success("用户信息更新成功");
                })
            },

            // 根据ID删除用户
            async removeUserById(id) {
                const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
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
                // 删除用户操作
                const {data: res} = await this.$http.delete("users/" + id);
                if (res.meta.status !== 200) {
                    return this.$message.error("用户删除失败");
                }
                this.$message.success("用户删除成功");
                this.getUserList();
            },

            // 设置角色(展示分配角色的对话框)
            async setRole(userInfo) {
                this.userInfo = userInfo;
                // 在展示对话框之前，获取所有角色的列表
                const {data: res} = await this.$http.get("roles");
                if (res.meta.status !== 200) {
                    return this.$message.error("获取角色列表失败");
                }
                this.rolesList = res.data;

                this.setRoleDialogVisible = true;
            },

            // 关闭选择角色对话框的事件
            setRoleDialogClosed() {
                this.selectedRoleId = "";
            },

            // 提交选择角色对话框的事件（给用户分配角色）
            async saveRoleInfo() {
                if (!this.selectedRoleId) {
                    return this.$message.error("请选择要分配的角色")
                }
                const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`,
                    {rid: this.selectedRoleId})
                if (res.meta.status !== 200) {
                    return this.$message.error("更新角色失败");
                }
                this.$message.success("更新角色成功");

                // 刷新用户列表
                this.getUserList();
                // 关闭对话框
                this.setRoleDialogVisible = false;
                // 重置select选择的值
                this.selectedRoleId = "";
            }

        }
    }
</script>

<style lang="less" scoped>

</style>
