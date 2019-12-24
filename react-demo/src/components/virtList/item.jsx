import React, { Component } from 'react'
import faker from 'faker'
import "./VirtList.scss"

export default class Item extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    /* eslint-disable-next-line */
    this.props.cacheItem(this.node, this.props.item)
  }

  render() {
    /* eslint-disable-next-line */
    const { index, item, cacheItem, ...others } = this.props

    return (
      <div
        {...others}
        className='list-item'
        ref={node => {
          this.node = node
        }}>
        {
          this.props.children
        }
      </div>
    )
  }
}
