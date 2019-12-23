import React, {lazy, Suspense} from 'react'
import { Route, Link, Switch } from 'react-router-dom'
import { Tabs, Cell, Button, Loading } from 'zarm'

const menu = [
  {
    title: '首页',
    path: '/',
    component: ()=>lazy(() => import(/* webpackChunkName: "Home" */ '../pages/Home.jsx'))
  },
  {
    title: '计数器',
    path: '/count',
    component: ()=>lazy(() => import(/* webpackChunkName: "Count" */ '../pages/Count.jsx'))
  },
  {
    title: '测试',
    path: '/test',
    component: ()=>lazy(() => new Promise(resolve => setTimeout(()=>resolve({
      default: ()=><div>哈哈哈哈哈哈哈哈哈大或所发或所多付</div>
    }), 3000)) )
  },
  {
    title: '列表',
    path: '/list',
    component: ()=>lazy(()=>import(/*webpackChunkName: "List" */ '../pages/List.jsx')),
  },
  {
    title: '测试列表',
    path: '/virtList',
    component: ()=>lazy(()=>import(/*webpackChunkName: "VirtList" */ '../pages/VirtListTest.jsx')),
  }
]
const PrimaryLayout = () => (
  <div className="primary-layout">
    <header>
      <div style={{ margin: 10 }}>
        {
          // 菜单
          menu.map((i, idex) => <span
            key={+idex}
            style={{
              marginRight: 5
            }}
          >
            <Button
              style={{ height: '30px' }}
              shape="rect"
              size="md"
              shadow
              ghost
              theme="primary"
              href={`#${i.path}`}
            >
              {i.title}
            </Button>
          </span>)
        }
      </div>
    </header>
    <main>
      <Suspense fallback={
        <Loading
          visible={true}
          stayTime={3000}
        />
      }>
        <Switch>
          {
            // 路由
             menu.map((item, idx)=><Route
               key={+idx}
               path={item.path}
               exact
               component={item.component()}
             />)
          }
        </Switch>
      </Suspense>
    </main>
  </div>
)

export default PrimaryLayout
