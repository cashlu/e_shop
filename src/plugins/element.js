import Vue from 'vue'
import {
    Button, Form, FormItem, Input, Message, Container, Header, Aside, Main,
    Menu, Submenu, MenuItem, Breadcrumb, BreadcrumbItem, Card, Row, Col,
    Table, TableColumn, Switch, Tooltip, Pagination, Dialog, MessageBox, Tag,
    Tree, Select, Option, Cascader,Alert, Tabs, TabPane,Steps, Step, Checkbox,
    CheckboxGroup, Upload
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
Vue.use(Tag)
Vue.use(Tree)
Vue.use(Select)
Vue.use(Option)
Vue.use(Cascader)
Vue.use(Alert)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Steps)
Vue.use(Step)
Vue.use(Checkbox)
Vue.use(CheckboxGroup)
Vue.use(Upload)

//Message组件需要全局挂载
// TODO：为什么要挂载在Vue的prototype上？为什么不能像其他组件一下使用？
Vue.prototype.$message = Message
// 注意MessageBox的挂载形式，挂载的是其下的confirm
Vue.prototype.$confirm = MessageBox.confirm

