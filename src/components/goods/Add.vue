<template>
    <div>
        <!--面包屑-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{path: '/home'}">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区 -->
        <el-card>
            <!-- 提示区 -->
            <el-alert
                :closable="false"
                title="添加商品信息"
                type="info">
            </el-alert>
            <!--  步骤条  -->
            <!-- activeIndex - 0,是因为activeIndex是字符串，这里-0，可以转换为int，之所以要转换，
            是因为这里的期望值是一个number类型 -->
            <el-steps :space="200"
                      :active="activeIndex - 0"
                      finish-status="success"
                      align-center>
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品照片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>

            <!-- 注意form和tabs的嵌套方法-->
            <el-form :model="addForm"
                     :rules="addFormRules"
                     ref="addFormRef"
                     label-width="100px"
                     label-position="top">
                <!-- 左侧Tabs栏 -->
                <!-- :tab-position="'left'" -->
                <!-- 让el-tabs和tl-steps联动，其实就是让他们共用同一个数据项。
                     el-steps通过active属性来控制激活那一项，而el-tabs通过v-model来绑定激活项的name属性，
                     那么只需要将两个组件的绑定到同一个变量activeIndex上，让el-tabs一旦改变，那么会修改
                     activeIndex的值为当前激活项的name（所以el-tabs的name值都为数字），然后el-steps监听
                     到了activeIndex的变化，自己的激活项也会随之更改。 -->
                <el-tabs v-model="activeIndex"
                         tab-position="left"
                         :before-leave="beforeTabLeave"
                         @tab-click="tabClicked">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="addForm.goods_price" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="addForm.goods_number" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <el-cascader
                                filterable
                                v-model="addForm.goods_cat"
                                :options="cateList"
                                :props="cateProps"
                                @change="handleChange">
                            </el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <!-- 商品动态参数 -->
                        <el-form-item v-for="item in manyAttr"
                                      :key="item.attr_id"
                                      :label="item.attr_name">
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox
                                    border
                                    v-for="(val, index) in item.attr_vals"
                                    :key="index"
                                    :label="val">
                                </el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item :label="item.attr_name" v-for="item in onlyAttr" :key="item.attr_id">
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <!--action表示图片上传的后端API地址，需要完整的绝对路径-->
                        <!-- list-type属性，决定了预览的展现形式 -->
                        <!--图片上传组件并没有使用axios，而是element自己封装的ajax，
                        所以请求头没有携带后端发过来的token，所以必须手动的将token添加到请求头中。-->
                        <el-upload
                            :headers="headerObj"
                            :action="upload_url"
                            :on-preview="handlePreview"
                            :on-remove="handleRemove"
                            list-type="picture"
                            :on-success="handleSuccess">
                            <el-button size="small" type="primary">点击上传</el-button>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <!-- 富文本编辑器组件 -->
                        <quill-editor v-model="addForm.goods_introduce">
                        </quill-editor>
                        <!-- 添加商品按钮 -->
                        <el-button type="primary" class="addBtn" @click="add">添加商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>
        <!-- 预览图片的对话框 -->
        <el-dialog
            title="图片预览"
            :visible.sync="previewVisible"
            width="50%">
            <img :src="previewPath" class="previewImg">
        </el-dialog>
    </div>
</template>
<script>
    import _ from "lodash"

    export default {
        name: "Add",
        data() {
            let checkPrice = (rule, value, callback) => {
                const regPrice = /^\+?(?!0+(\d|(\.00?)?$))\d+(\.\d\d?)?$/;
                if (regPrice.test(value)) {
                    return callback();
                }
                callback(new Error("请输入合法的价格"));
            };
            let checkWeight = (rule, value, callback) => {
                const regPrice = /^\+?(?!0+(\d|(\.00?)?$))\d+(\.\d\d?)?$/;
                if (regPrice.test(value)) {
                    return callback();
                }
                callback(new Error("请输入合法的重量"));
            };
            let checkNumber = (rule, value, callback) => {
                const regNumber = /^\+?(?!0+(\d|(\.00?)?$))\d+(\.\d\d?)?$/;
                if (regNumber.test(value)) {
                    return callback();
                }
                callback(new Error("请输入合法的数量"));
            };
            return {
                activeIndex: "0",
                // 添加商品的表单对象
                addForm: {
                    goods_name: "",
                    goods_price: 0,
                    goods_weight: 0,
                    goods_number: 0,
                    // 级联选择器选中后，返回的是一个数组，不过在api接口中，
                    // 需要的是一个逗号分隔的字符串，所以在提交之前，需要处理一下。
                    goods_cat: [],
                    // 上传图片的路径数组，数组中保存的都是对象。
                    pics: [],
                    // 富文本编辑器（商品详情）绑定的属性
                    goods_introduce: "",
                    // 商品的动态参数和静态属性
                    attrs: [],
                },
                // 添加商品表单的验证规则
                addFormRules: {
                    goods_name: [
                        {required: true, message: "请输入商品名称", trigger: "blur"}
                    ],
                    goods_price: [
                        {required: true, message: "请输入商品价格，价格必须>0", trigger: "blur"},
                        {validator: checkPrice, trigger: "blur"}
                    ],
                    goods_weight: [
                        {required: true, message: "清输入商品重量，重量必须>0", trigger: "blur"},
                        {validator: checkWeight, trigger: "blur"}
                    ],
                    goods_number: [
                        {required: true, message: "请输入商品的数量，数量必须>=0", trigger: "blur"},
                        {validator: checkNumber, trigger: "blur"}
                    ],
                    goods_cat: [
                        {type: 'array', required: true, message: "请选择商品分类", trigger: "blur"}
                    ],
                },
                // 商品分类级联选择器的props
                cateProps: {
                    label: "cat_name",
                    value: "cat_id",
                    children: "children",
                    expandTrigger: 'hover',
                },
                // 商品分类信息
                cateList: [],
                // 商品分类对应的动态参数
                manyAttr: [],
                // 商品分类对应的静态属性
                onlyAttr: [],
                // 图片上传的url地址
                upload_url: "http://127.0.0.1:8888/api/private/v1/upload",
                // 图片上传组件并没有使用axios，而是element自己封装的ajax，所以请求头没有携带后端
                // 发过来的token，所以必须手动的将token添加到请求头中。
                headerObj: {
                    authorization: window.sessionStorage.getItem("token"),
                },
                // 图片预览的路径
                previewPath: "",
                // 图片预览对话框的展示与否
                previewVisible: false,
            }
        },
        methods: {
            async getCateList() {
                const {data: res} = await this.$http.get("categories");
                if (res.meta.status !== 200) {
                    return this.$message.error("获取商品分类信息失败");
                }
                this.cateList = res.data;
            },
            // 级联选择器选项发生变化时，会执行这个方法。
            handleChange() {
                if (this.addForm.goods_cat.length !== 3) {
                    this.addForm.goods_cat = [];
                    return;
                }
            },
            // 标签页切换的处理函数
            // 如果处在第一个标签页，且商品分类未选择，那么不能切换。
            beforeTabLeave(activeName, oldActiveName) {
                if (oldActiveName === "0" && this.addForm.goods_cat.length !== 3) {
                    this.$message.error("请先选择商品分类");
                    return false;
                }
            },
            // 添加商品页面，点击左侧tab的处理函数
            async tabClicked() {
                let cateId = "";
                let sel = 0;
                if (this.activeIndex === "1") {
                    sel = "many";
                    const {data: res} = await this.$http.get(
                        `categories/${this.selectedCateId}/attributes`, {
                            params: {
                                sel: sel
                            }
                        });
                    if (res.meta.status !== 200) {
                        return this.$message.error("商品参数获取失败");
                    }
                    // 将每一个商品分类的attr_vals由字符串转换为数组。
                    res.data.forEach((item) => {
                        item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
                    });
                    this.manyAttr = res.data;
                } else if (this.activeIndex === "2") {
                    sel = "only";
                    const {data: res} = await this.$http.get(
                        `categories/${this.selectedCateId}/attributes`, {
                            params: {
                                sel: sel
                            }
                        });
                    if (res.meta.status !== 200) {
                        return this.$message.error("商品属性获取失败");
                    }
                    console.log(res.data);
                    this.onlyAttr = res.data;
                }
            },

            // 上传图片成功后的处理函数
            // 创建商品的时候，api接口中有一个字段是商品图片的相关信息，
            // 例如保存的路径等，这里需要处理一下。
            handleSuccess(response) {
                // 上传成功后，后端会返回一个response，其中有图片的信息，
                // 这里需要将图片的路径信息push到this.addForm.pics数组中。
                const picInfo = {pic: response.data.tmp_path};
                this.addForm.pics.push(picInfo);
            },

            // 上传图片功能中，将图片从列表移除事件的处理函数
            // 移除图片的功能，后端没有给出API，而且据观察，后端的代码也没有处理移除的图片的文件，
            // 前端这里的操作，只是把被移除图片和要添加的商品之间的关系做了解绑。如果是真实的情况，
            // 前端应该告知后端做了移除的操作，而后端应该有相应的处理。
            handleRemove(file) {
                // 1 - 获取将要删除的图片的临时路径
                // 2 - 从pics数组中，找到这个图片对应的索引值
                // 3 - 调用数组的splice方法，把图片信息对象，从数组中移除。

                const filePath = file.response.data.tmp_path;
                // addForm.pics中的每一个元素，都有一个pic属性来保存图片的路径。
                const i = this.addForm.pics.findIndex(x => x.pic === filePath);
                this.addForm.pics.splice(i, 1);
            },

            // 上传图片功能中，点击图片预览的处理函数。
            handlePreview(file) {
                // on-preview事件接受一个file参数，就是将要预览的图片信息，返回的图片信息是一个对象，
                // 里面包含了一个response对象，里面有图片的保存路径和url。
                console.log(file);
                this.previewPath = file.response.data.url;
                this.previewVisible = true;
            },
            // 添加商品按钮的点击事件处理函数
            add() {
                // console.log(this.addForm.goods_introduce);
                // 对表单做预验证
                this.$refs.addFormRef.validate(async (valid) => {
                    if (!valid) {
                        return this.$message.error("请填写必要的表单项");
                    }


                    // 目前动态参数和静态属性还分别保存在manyAttr和onlyAttr两个数组中，而且所包含的属性
                    // 比后端需要的多，所以要处理这两个数组，提取出需要的数据，添加到addForm.attrs中。
                    this.manyAttr.forEach((item) => {
                        const newInfo = {
                            attr_id: item.attr_id,
                            attr_value: item.attr_vals.join(" ")
                        };
                        this.addForm.attrs.push(newInfo);
                    });
                    this.onlyAttr.forEach((item) => {
                        const newInfo = {
                            attr_id: item.attr_id,
                            attr_value: item.attr_vals,
                        };
                        this.addForm.attrs.push(newInfo);
                    });
                    // 执行添加的业务逻辑
                    // 后端要求的goods_cat是一个字符串，现在是一个数组，需要转换
                    // 这里为了避免某些版本的cascader的兼容性问题，引入了lodash包的cloneDeep()做对象的深拷贝。
                    // cascader双向绑定的是一个数组，而后端接口需要的是一个字符串，如果这里直接将
                    // addForm.goods_cat转换为字符串，那么cascader可能会出问题，所以这里拷贝出来一个新的form,
                    // 将新form的goods_cat转换为字符串，然后发送给后端。
                    // 还有一个方法：JSON.parse(JSON.stringify(this.addForm))
                    const form = _.cloneDeep(this.addForm);
                    form.goods_cat = form.goods_cat.join(",");

                    console.log(form);
                    // 发起请求，添加商品，商品的名称必须是唯一的。
                    const {data: res} = await this.$http.post("goods", form);
                    if (res.meta.status !== 201) {
                        return this.$message("添加商品失败");
                    }
                    console.log(res.total);
                    this.$message.success("添加商品成功");
                    this.$router.push("/goods");
                })
            }


        },
        computed: {
            // 选中的三级分类的ID
            selectedCateId() {
                if (this.addForm.goods_cat.length === 3) {
                    return this.addForm.goods_cat[2];
                }
                return null;
            },
        },
        created() {
            this.getCateList();
        },
    }
</script>

<style scoped>
    .el-checkbox {
        margin: 0 10px 0 0 !important;
    }

    .previewImg {
        width: 100%;
    }

    .addBtn {
        margin-top: 15px;
    }
</style>
