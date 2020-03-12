import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 引入iconfont样式表
import './assets/fonts/iconfont.css'
// 导入axios
import axios from 'axios'
// 导入vue-table-with-tree-grid
import TreeTable from 'vue-table-with-tree-grid'
// 导入vue-quill-editor
import VueQuillEditor from 'vue-quill-editor'
// 导入vue-quill-editor样式文件
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

// 将Axios挂载在Vue的原型对象上。
Vue.prototype.$http = axios;
// 设置请求的根路径，这不是必须的，不过设置的话，在调用的时候，可以不写这一部分路径。
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/";

//axios请求拦截器，用于在每次发起请求时，在request的header中包含token，让后端验证。
axios.interceptors.request.use(config => {
    // console.log("config: \n", config);
    // 给请求头添加authorization属性，值是token（token之前获取后，存放在sessionStorage中）
    config.headers.authorization = window.sessionStorage.getItem("token");
    // console.log(config);
    // 在最后必须return config
    return config;
});

// 定义一个全局的过滤器
Vue.filter("dateFormat", function (originValue) {
    const dt = new Date(originValue);
    const year = dt.getFullYear();
    // 如果月份不足两位，前面补充一个0
    const month = (dt.getMonth() + 1 + "").padStart(2,"0");
    // 还有一种写法
    // const month = ("0" + dt.getMonth() + 1).slice(-2);
    const day = (dt.getDate() + "").padStart(2, "0");
    const hour = (dt.getHours() + "").padStart(2, "0");
    const minute = (dt.getMinutes() + "").padStart(2, "0");
    const second = (dt.getSeconds() + "").padStart(2, "0");
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
});

Vue.config.productionTip = false;

// 注册TreeTable为全局组件
Vue.component('tree-table', TreeTable);

// 注册vue-quill-editor
Vue.use(VueQuillEditor);


new Vue({
    router,
    render: h => h(App)
}).$mount('#app');
