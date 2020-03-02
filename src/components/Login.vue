<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="">
      </div>
      <!-- 登录表单区 -->
      <!-- v-bind:something可以简写为:something -->
      <!-- 一定要注意，:model是v-bind:model，不是v-model-->
      <!-- ref相当于返回DOM对象-->
      <el-form label-width="0px" class="login_form" ref="loginFormRef"
               :model="loginForm" :rules="loginFormRules">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input prefix-icon="el-icon-user"
                    placeholder="请输入用户名"
                    v-model="loginForm.username"
                    clearable>
          </el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input prefix-icon="el-icon-lock"
                    placeholder="请输入密码"
                    v-model="loginForm.password"
                    show-password
                    clearable>
          </el-input>
        </el-form-item>
        <!-- 按钮区 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
    export default {
        name: 'Login',
        data() {
            return {
                //loginForm是登录表单的数据绑定对象
                loginForm: {
                    username: "admin",
                    password: "123456",
                },
                loginFormRules: {
                    username: [
                        {required: true, message: "用户名是必填项", trigger: 'blur'},
                        {min: 3, max: 30, message: "长度在3-30个字符之间", trigger: 'blur'}
                    ],
                    password: [
                        {required: true, message: "密码是必填项", trigger: 'blur'},
                        {min: 6, max: 30, message: "长度在6-30个字符之间", trigger: 'blur'}
                    ]
                }
            }
        },
        methods: {
            resetLoginForm() {
                // 重置登录表单
                // 需要在form上定义ref属性
                this.$refs.loginFormRef.resetFields();

            },
            login() {
                // 登录前的预验证，login()方法绑定在登录按钮的click事件上。
                // 调用表单实例的validate()方法，该方法返回boolean值，代表预验证是否通过，
                // 还可以传递一个回调函数。
                // 在本例中，将打印预验证的结果。然后通过axios向后端发起登录请求。
                this.$refs.loginFormRef.validate((valid) => {
                    if (!valid) {
                        return;
                    }
                    this.$http.post("login", this.loginForm)
                        .then((res) => {
                            if (res.data.meta.status === 200) {
                                this.$message.success("登陆成功");
                                // 将token写入sessionStorage
                                window.sessionStorage.setItem('token', res.data.data.token);
                                // 登陆成功后，跳转到管理页面
                                this.$router.push('/home');
                            } else {
                                this.$message.error("登陆失败");
                            }
                        })
                })
            }
        }
    }
</script>

<style lang="less" scoped>
  .login_container {
    background-color: #2b4b6b;
    height: 100%;
  }

  .login_box {
    width: 450px;
    height: 400px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  .avatar_box {
    width: 130px;
    height: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    /* 给边框加上阴影 */
    box-shadow: 0 0 10px #dddddd;
    /* 以下三行，让容器绝对定位。向右移一半的距离，
    然后在向左移自身的一半，实现居中。 */
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #ffffff;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eeeeee;
    }
  }

  .btns {
    /* 使用弹性盒模型，让两个按钮居右显示。 */
    display: flex;
    justify-content: flex-end;
  }

  .login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    /* 让form不要超出容器 (盒子溢出)*/
    box-sizing: border-box;
  }


</style>
