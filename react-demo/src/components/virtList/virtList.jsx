import React, { Component } from 'react'
import Item from './item'
import './VirtList.scss'

const throttle = (fn, interval = 300) => {
  let canRun = true
  return function() {
    if (!canRun) return
    canRun = false
    fn.apply(this, arguments)
    setTimeout(() => {
      canRun = true
    }, interval)
  }
}

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

    //预估高度
    this.estimatedItemSize = props.estimatedItemSize || 120

    // 不可见item数量是可见区域item数量的多少倍
    this.bufferScale = props.bufferScale || 1

    this.itemsDom = []

  }

  // 初始化数据
  initPositions() {
    const { data } = this.props
    const { estimatedItemSize } = this
    this.setState({
      positions: data.map((d, index) => ({
          index,
          height: estimatedItemSize,
          top: index * estimatedItemSize,
          bottom: (index + 1) * estimatedItemSize
        })
      )
    })
  }

  // 缓存已经渲染的item
  cacheItem(node, item) {
    const { _index: index } = item
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

  // 根据scrollTop值来定位list中的所处位置
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
    const { positions, start, end, aboveCount, belowCount } = this.state
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
    const { visibleCount, screenHeight, positions } = this.state
    const { data, loading } = this.props
    //当前滚动位置
    let scrollTop = this.refs.list.scrollTop
    //此时的开始索引
    const start = this.getStartIndex(scrollTop)
    //此时的结束索引
    const end = start + visibleCount > data.length ? data.length : (start + visibleCount)

    const bufferScaleCount = this.bufferScale * visibleCount

    const aboveCount = Math.ceil(Math.min(start, bufferScaleCount))
    const belowCount = Math.ceil(Math.min(data.length - end, bufferScaleCount))
    const totalHeight = positions[positions.length - 1].bottom
    this.setState({
      start,
      end,
      aboveCount,
      belowCount
    }, () => {
      //此时的偏移量
      this.setStartOffset()
      if (!loading && screenHeight + scrollTop + (this.props.scrollDistance || 0) >= totalHeight && belowCount === 0 && end === data.length) {
        throttle(() => {
          'function' === typeof this.props.infiniteScroll && this.props.infiniteScroll()
        }, 2000)()
      }
    })
    // 对外抛出scroll事件
    'function' === typeof this.props.scrollEvent && this.props.scrollEvent(scrollTop, start, end, aboveCount, belowCount, visibleCount)
  }
  // 重置高度
  resetHeight() {
    const wrapperHeight = this.refs.list.getBoundingClientRect().height
    const visibleCount = Math.ceil(wrapperHeight / this.estimatedItemSize)
    const bufferScaleCount = this.bufferScale * visibleCount
    const { data } = this.props
    const { start, end } = this.state
    this.initPositions()
    this.setState({
      screenHeight: wrapperHeight,
      start: start,
      visibleCount,
      end: end + visibleCount,
      aboveCount: Math.ceil(Math.min(start, bufferScaleCount)),
      belowCount: Math.ceil(Math.min(data.length - (end + visibleCount), bufferScaleCount))
    })
  }

  componentDidMount() {
    this.resetHeight()
  }

  componentDidUpdate(prevProps) {
    if (!this.refs.list) return
    if (this.props.data !== prevProps.data) {
      this.resetHeight()
    }
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
    const { data } = this.props
    let startTMP = start - aboveCount
    let endTMP = end + belowCount
    const visibleData = data.map((item, index) => {
      return {
        _index: index,
        item
      }
    }).slice(startTMP, endTMP)
    // 提示用 渲染data-area
    const dataAreaRender = (index) => {
      if (index < start) {
        // 在可视区上隐藏, 为了防止向上滚动留白
        return 'header-hide-area'
      } else if (index > end) {
        // 在可视区下隐藏, 为了防止向下滚动留白
        return 'bottom-hide-area'
      } else {
        // 在可视区内
        return 'scroll-inview-area'
      }
    }

    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div
          ref={'list'}
          style={{ flex: 1 }}
          className="infinite-list-container"
          onScroll={(e) => this.scrollEvent(e)}
        >
          <div ref={'phantom'} className="infinite-list-phantom"></div>
          <div ref={'content'} className="infinite-list">
            {
              visibleData.map((item) => {
                return (
                  <Item
                    data-area={dataAreaRender(item._index)}
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
            {/* 加载处理 */}
            {
              this.props.loading && (this.props.loadingComponent ||
                <div className="infinite-loading"><span>加载中...</span></div>)
            }
          </div>

        </div>
      </div>
    )
  }
}

export default VirtualizedList
