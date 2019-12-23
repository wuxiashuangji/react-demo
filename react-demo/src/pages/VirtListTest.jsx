import React, { Component } from 'react'
import VirtList from './../components/virtList'

const data = new Array(100)
  .fill(
    { name: '哈哈哈哈哈哈哈哈哈哈哈哈哈哈' }
  )
  .map(
    (item, index) => Object.assign({}, item, { key: index })
  )

export default class VirtualizedList extends Component {
  componentWillMount() {
  }

  render() {

    return <div style={{ height: 500 }}>
      <VirtList data={data} itemRender={(item, index) => (<div>
        <p>{`内容-${index}: `}</p>
        {
          new Array(index%12).fill('').map((d, idx)=><p key={+idx}>哈哈哈</p>)
        }
        {
          '哈哈哈哈多或哈所多或付或付多或多付或或多付' + `${index}`
        }
      </div>)}>
      </VirtList>
    </div>
  }
}

