<template>
    <div>
        <el-button type="info" @click="logout">退出</el-button>
    </div>
</template>

<script>
    export default {
        name: "Home",
        methods:{
            logout(){
                // 登出功能的实现：
                // 1 - 清除sessionStorage中的token
                // 2 - 路由跳转到login页面
                window.sessionStorage.clear();
                this.$router.push('/login');
            }
        }
    }
</script>

<style scoped>

</style>
