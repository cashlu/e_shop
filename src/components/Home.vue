<template>

    <el-container class="home-container">
        <!-- 头部 -->
        <el-header>
            <div>
                <img src="../assets/heima.png" alt="">
                <span>管理系统</span>
            </div>
            <el-button type="info" @click="logout">退出</el-button>
        </el-header>

        <el-container>
            <!-- 侧边栏 -->
            <el-aside :width="isCollapsed ? '64px' : '200px'">
                <div class="toggle-button" @click="toggleCollapse">|||</div>
                <!-- 侧边栏菜单区 -->
                <!--TODO: 详细了解:router:"true"这个配置的细节-->
                <!--TODO: 了解一下default-active的配置-->
                <el-menu
                    :router="true"
                    :collapse="this.isCollapsed"
                    :collapse-transition="false"
                    unique-opened
                    background-color="#333744"
                    text-color="#fff"
                    active-text-color="#409bff"
                    :default-active="$route.path">

                    <!-- 一级菜单 -->
                    <!-- index中拼接字符串，是因为这个属性的期望值是个字符串-->
                    <el-submenu :index="item.id + ''" v-for="item in menuList" v-bind:key="item.id">
                        <!-- 一级菜单模板区 -->
                        <template slot="title">
                            <!-- 图标 -->
                            <i :class="iconsObj[item.id]"></i>
                            <!-- 文本 -->
                            <span>{{item.authName}}</span>
                        </template>
                        <!-- 二级菜单 -->
                        <el-menu-item :index="'/' + subItem.path"
                                      v-for="subItem in item.children" v-bind:key="subItem.id"
                        >
                            <template slot="title">
                                <!-- 图标 -->
                                <i class="el-icon-menu"></i>
                                <!-- 文本 -->
                                <span>{{subItem.authName}}</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <!-- 主体 -->
            <el-main>
                <!-- 路由占位符 -->
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
    import Welcome from "./Welcome";

    export default {
        name: "Home",
        components: {
            // 这里不要引用模板中不会显式调用的component
        },
        data() {
            return {
                menuList: [],
                iconsObj: {
                    "125": "iconfont icon-user",
                    "103": "iconfont icon-tijikongjian",
                    "101": "iconfont icon-shangpin",
                    "102": "iconfont icon-danju",
                    "145": "iconfont icon-baobiao",
                },
                // 是否折叠
                isCollapsed: false,
            }
        },
        methods: {
            logout() {
                // 登出功能的实现：
                // 1 - 清除sessionStorage中的token
                // 2 - 路由跳转到login页面
                window.sessionStorage.clear();
                this.$router.push('/login');
            },
            // 获取所有的菜单
            async getMenuList() {
                const {data: res} = await this.$http.get('menus');
                // console.log(res);
                if (res.meta.status !== 200) {
                    return this.$message.error("res.meta.msg");
                }
                this.menuList = res.data;
                // console.log(this.menuList)
            },
            // getMenuList() {
            //     // const res = this.$http.get('menus');
            //     // console.log(res.data);
            //     this.$http.get('menus').then(res => {
            //         console.log(res.data);
            //     })
            // },

            // 点击按钮切换菜单的折叠
            toggleCollapse() {
                this.isCollapsed = !this.isCollapsed;
            }
        },
        created() {
            // 在页面一加载，第一时间就先获取菜单项。菜单的数据是中后端请求来的。
            this.getMenuList();
        }
    }
</script>

<style lang="less" scoped>
    /* TODO: 这里为什么要自定义class做选择器？而不是用element自带的类？*/
    .home-container {
        height: 100%;
    }

    .el-header {
        background-color: #373d41;
        /*  左右的这种布局，用flex做最轻松  */
        display: flex;
        justify-content: space-between;
        /* 让logo紧挨左侧边缘 */
        padding-left: 0;
        /* 让右侧按钮垂直居中(不设置居中的话，会在垂直方向沾满空间) */
        align-items: center;
        color: #ffffff;
        font-size: 20px;

        > div {
            display: flex;
            align-items: center;

            span {
                margin-left: 15px;
            }
        }
    }

    .el-aside {
        background-color: #333744;
    }

    .el-main {
        background-color: #eaedf1;
    }

    .el-menu {
        /* TODO: 貌似el-menu比上层容器宽了一个像素？ */
        /*width: 200px;*/
        border-right: 0;
    }

    .iconfont {
        margin-right: 10px;
    }

    .toggle-button {
        background-color: #4a5064;
        font-size: 10px;
        line-height: 20px;
        text-align: center;
        color: #ffffff;
        /* 让3条竖线之间有点儿间距 */
        letter-spacing: 0.2em;
        cursor: pointer;
    }

</style>
