import React, { Component } from 'react'
import { Loading } from 'zarm'
import VirtList from './../components/virtList'

const data = new Array(10)
  .fill(
    { name: '哈哈哈哈哈哈哈哈哈哈哈哈哈哈' }
  )
  .map(
    (item, index) => Object.assign({}, item, { key: index })
  )

export default class VirtualizedList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      data: []
    }
  }

  componentDidMount() {
    this.setState({
      data: [...data]
    })
  }

  componentWillMount() {
  }

  render() {
    return <div style={{ height: 500, border: '1px solid pink' }}>
      <VirtList
        data={[...this.state.data]}
        loading={true}
        infiniteScroll={() => {
          console.log('滚动到底了, 触发了infiniteScroll---')
          this.setState({
            loading: true
          })
        }}
        scrollEvent={(scrollTop) => {
          console.log(scrollTop, 'scrollTop')
        }}
        loading={this.state.loading}
        // loadingWrapper={
        //   <Loading
        //     visible={this.state.loading}
        //     stayTime={3000}
        //   />
        // }
        itemRender={(item, index) => (<div>
          <p>{`内容-${index}: `}</p>
          {
            new Array(index % 12).fill('').map((d, idx) => <p key={+idx}>哈哈哈</p>)
          }
          {
            '哈哈哈哈多或哈所多或付或付多或多付或或多付' + `${index}`
          }
        </div>)}>
      </VirtList>
    </div>
  }
}

