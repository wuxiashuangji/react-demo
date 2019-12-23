import React, { Component } from 'react'
import Item from './item'

class VirtualizedList extends Component {
  constructor(props) {
    super(props)

    this.state = {
      //可视区域高度
      screenHeight: 0,
      //起始索引
      start: 0,
      //结束索引
      end: 0,

      _listData: [], // 格式化后的内部数据

      visibleCount: 0, // 可视区 显示item的个数

      aboveCount: 0, // 头部隐藏区 个数

      belowCount: 0, // 底部隐藏区 个数

      positions: [] // 位置信息缓存
    }

    this.listData = props.data || []

    //预估高度
    this.estimatedItemSize = props.estimatedItemSize || 20

    // 不可见item数量是可见区域item数量的多少倍
    this.bufferScale = props.bufferScale || 1.2

    this.itemsDom = []

  }
  // 初始化数据
  initPositions() {
    this.setState({
      positions: this.listData.map((d, index) => ({
          index,
          height: this.estimatedItemSize,
          top: index * this.estimatedItemSize,
          bottom: (index + 1) * this.estimatedItemSize
        })
      )
    })
  }

  // 缓存已经渲染的item
  cacheItem(node, index) {
    if (this.itemsDom[index] && this.itemsDom[index].height === node.getBoundingClientRect().height) {
      return false
    }
    const { height, width } = node.getBoundingClientRect()

    this.itemsDom[index] = { height, id: index }
  }

  // 获取列表起始索引
  getStartIndex(scrollTop = 0) {
    //二分法查找
    return this.binarySearch(this.state.positions, scrollTop)
  }

  binarySearch(list, value) {
    let start = 0
    let end = list.length - 1
    let tempIndex = null

    while (start <= end) {
      let midIndex = parseInt((start + end) / 2)
      let midValue = list[midIndex].bottom
      if (midValue === value) {
        return midIndex + 1
      } else if (midValue < value) {
        start = midIndex + 1
      } else if (midValue > value) {
        if (tempIndex === null || tempIndex > midIndex) {
          tempIndex = midIndex
        }
        end = end - 1
      }
    }
    return tempIndex
  }

  //获取列表项的当前尺寸
  updateItemsSize() {
    let nodes = this.itemsDom
    let positionsTmpArr = [...this.state.positions]
    nodes.forEach((item) => {
      if (!item) {
        return false
      }
      let height = item.height
      const index = item.id
      let oldHeight = positionsTmpArr[index].height
      let dValue = oldHeight - height

      //存在差值
      if (dValue) {
        positionsTmpArr[index].bottom = positionsTmpArr[index].bottom - dValue
        positionsTmpArr[index].height = height
        for (let k = index + 1; k < positionsTmpArr.length; k++) {
          positionsTmpArr[k].top = positionsTmpArr[k - 1].bottom
          positionsTmpArr[k].bottom = positionsTmpArr[k].bottom - dValue
        }
        this.setState({
          positions: positionsTmpArr
        })
      }
    })

  }

  //获取当前的偏移量
  setStartOffset() {
    const { positions, start, aboveCount } = this.state
    let startOffset
    if (start >= 1) {
      let size = positions[start].top - (positions[start - aboveCount] ? positions[start - aboveCount].top : 0)
      startOffset = positions[start - 1].bottom - size
    } else {
      startOffset = 0
    }
    this.refs.content.style.transform = `translate3d(0,${startOffset}px,0)`
  }

  //滚动事件
  scrollEvent() {
    const { visibleCount } = this.state
    //当前滚动位置
    let scrollTop = this.refs.list.scrollTop
    //此时的开始索引
    const start = this.getStartIndex(scrollTop)
    //此时的结束索引
    const end = start + visibleCount

    const bufferScaleCount = this.bufferScale * visibleCount

    const aboveCount = Math.ceil(Math.min(start, bufferScaleCount))
    const belowCount = Math.ceil(Math.min(this.listData.length - (start + visibleCount), bufferScaleCount))

    this.setState({
      start,
      end,
      aboveCount,
      belowCount
    }, () => {
      //此时的偏移量
      this.setStartOffset()
    })
  }

  componentWillMount() {
    this.initPositions()
  }

  componentDidMount() {
    const wrapperHeight = this.refs.list.getBoundingClientRect().height
    const visibleCount = Math.ceil(wrapperHeight / this.estimatedItemSize)
    const bufferScaleCount = this.bufferScale * visibleCount
    this.setState({
      screenHeight: wrapperHeight,
      start: 0,
      visibleCount,
      end: 0 + visibleCount,
      aboveCount: Math.ceil(Math.min(0, bufferScaleCount)),
      belowCount: Math.ceil(Math.min(this.listData.length - (0 + visibleCount), bufferScaleCount))
    })
  }

  componentDidUpdate() {
    if (!this.itemsDom.length) {
      return
    }
    //获取真实元素大小，修改对应的尺寸缓存
    this.updateItemsSize()
    //更新列表总高度
    let height = this.state.positions[this.state.positions.length - 1].bottom
    this.refs.phantom.style.height = height + 'px'
    //更新真实偏移量
    this.setStartOffset()
  }


  render() {
    const { start, end, aboveCount, belowCount } = this.state
    let startTMP = start - aboveCount
    let endTMP = end + belowCount

    const visibleData = this.listData.map((item, index) => {
      return {
        _index: index,
        item
      }
    }).slice(startTMP, endTMP)

    return (
      <div
        ref={'list'}
        style={{ height: '100%' }}
        className="infinite-list-container"
        onScroll={(e) => this.scrollEvent(e)}
      >
        <div ref={'phantom'} className="infinite-list-phantom"></div>
        <div ref={'content'} className="infinite-list">
          {
            visibleData.map((item) => {
              return (
                <Item
                  data-isabove={item._index < start ? '头部分隐藏区' : ''}
                  data-isvisible={item._index >= start && item._index <= end ? '可视区' : ''}
                  data-isbelow={item._index > end ? '底部分隐藏区' : ''}
                  className="infinite-list-item"
                  cacheItem={this.cacheItem.bind(this)}
                  index={item._index}
                  key={item._index}
                  item={item}
                  id={item._index}
                >
                  {
                    'function' === typeof this.props.itemRender && this.props.itemRender(item, item._index)
                  }
                </Item>
              )
            })
          }
        </div>
      </div>
    )
  }
}

export default VirtualizedList
