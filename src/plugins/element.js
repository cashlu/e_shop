import Vue from 'vue'
import {
    Button, Form, FormItem, Input, Message, Container, Header, Aside, Main,
    Menu, Submenu, MenuItem, Breadcrumb, BreadcrumbItem, Card, Row, Col,
    Table, TableColumn, Switch, Tooltip, Pagination, Dialog, MessageBox
} from 'element-ui'


Vue.use(Button)
Vue.use(Form)
Vue.use((FormItem))
Vue.use(Input)
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Menu)
Vue.use(Submenu)
Vue.use(MenuItem)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Row)
Vue.use(Col)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)

//Message组件需要全局挂载
// TODO：为什么要挂载在Vue的prototype上？为什么不能像其他组件一下使用？
Vue.prototype.$message = Message
// 注意MessageBox的挂载形式，挂载的是其下的confirm
Vue.prototype.$confirm = MessageBox.confirm

