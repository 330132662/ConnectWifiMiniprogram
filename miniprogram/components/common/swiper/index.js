const START = 0
const END = 2
const SWIPER_LENGTH = 3
const NO_PREV_PAGE = -1
const NO_NEXT_PAGE = -2

const setIndexForList = list => {
  let resultList = []
  if (list && list.length) {
    resultList = list.map((item, index) => {
      item.index = index
      return item
    })
  }
  return resultList
}

Component({
  observers: {
    current(index) {
      let _self = this
      let current = index % SWIPER_LENGTH
      let { swiperIndex, swiperList } = _self.data
      if (swiperList.length == 0 || !swiperList[current]) {
        return
      }
      // 如果change后还是之前的那一个item，直接return
      if (current == swiperIndex && swiperList[swiperIndex].index == index) {
        return
      }
      _self.init(index)
      if (current == swiperIndex) {
        _self.triggerEvent('change', { source: '', current: index })
      }
    },
  },
  properties: {
    list: {
      type: Array,
      value: [],
    },
    current: {
      type: Number,
      value: 0,
    },
    // 值为0禁止切换动画
    swiperDuration: {
      type: String,
      value: '250',
    },
    // 分页需要传此数据
    total: {
      type: Number,
      value: 0,
    },
  },
  data: {
    circular: true,
    // 滑动到的位置
    swiperIndex: 0,
    // 此值控制swiper的位置
    swiperCurrent: 0,
    // 当前swiper渲染的items
    swiperList: [],
  },
  methods: {
    init(defaultIndex) {
      const _self = this
      const list = _self.data.list
      const listLength = list.length
      if (!list || !listLength) {
        return
      }
      this.listLength = listLength
      const currentIndex = defaultIndex % SWIPER_LENGTH
      _self.setData({
        swiperList: _self.getInitSwiperList(defaultIndex),
        // 滑动时，将要滑动到的那个index
        swiperIndex: currentIndex,
        // 当前index
        swiperCurrent: currentIndex,
      })
    },
    clear() {
      this.setData({
        list: [],
        swiperList: [],
      })
    },
    swiperChange(e) {
      const _self = this
      const currentIndex = e.detail.current
      const currentItem = _self.data.swiperList[currentIndex]
      const lastIndex = _self.data.swiperIndex

      let info = {}
      info.source = e.detail.source
      // 正向衔接
      const isLoopPositive = currentIndex == START && lastIndex == END
      if (currentIndex - lastIndex == 1 || isLoopPositive) {
        // 如果是滑到了左边界或者下一个还未有值，弹回去
        if (!currentItem) {
          info.current = NO_NEXT_PAGE
          _self.setData({
            swiperCurrent: lastIndex,
          })
          return
        }
        setTimeout(() => {
          const swiperChangeItem =
            'swiperList[' + _self.getNextSwiperIndex(currentIndex) + ']'
          _self.setData({
            [swiperChangeItem]: _self.getNextSwiperItem(
              currentItem,
              _self.data.list
            ),
          })
        }, 200)
      }
      // 反向衔接
      const isLoopNegative = currentIndex == END && lastIndex == START
      if (lastIndex - currentIndex == 1 || isLoopNegative) {
        // 如果滑到了右边界或者上一个还未有值，弹回去
        if (!currentItem) {
          info.current = NO_PREV_PAGE
          _self.setData({
            swiperCurrent: lastIndex,
          })
          return
        }
        setTimeout(() => {
          const swiperChangeItem =
            'swiperList[' + _self.getLastSwiperIndex(currentIndex) + ']'
          _self.setData({
            [swiperChangeItem]: _self.getLastSwiperItem(
              currentItem,
              _self.data.list
            ),
          })
        }, 200)
      }
      if (!currentItem) {
        return
      }
      info.current = currentItem.index
      this.triggerEvent('change', info)
      // 记录滑过来的位置，此值对于下一次滑动的计算很重要
      _self.setData({ swiperIndex: currentIndex, swiperCurrent: currentIndex })
    },
    getInitSwiperList(defaultIndex) {
      const list = this.data.list
      const swiperIndex = defaultIndex % SWIPER_LENGTH
      const _self = this

      const realIndex = list.findIndex(item => item.index == defaultIndex)
      const currentItem = list[realIndex]

      const swiperList = []
      swiperList[swiperIndex] = currentItem
      swiperList[_self.getLastSwiperIndex(swiperIndex)] =
        _self.getLastSwiperItem(currentItem, list)
      swiperList[_self.getNextSwiperIndex(swiperIndex)] =
        _self.getNextSwiperItem(currentItem, list)
      return swiperList
    },
    getLastSwiperIndex(current) {
      return current > START ? current - 1 : END
    },
    getNextSwiperIndex(current) {
      return current < END ? current + 1 : START
    },

    getLastSwiperItem(currentItem, list) {
      if (!currentItem) {
        return null
      }
      let lastRealIndex = currentItem.index - 1
      lastRealIndex = list.findIndex(item => item.index == lastRealIndex)
      const item = lastRealIndex == -1 ? null : list[lastRealIndex]
      return item
    },
    getNextSwiperItem(currentItem, list) {
      if (!currentItem) {
        return null
      }
      let nextRealIndex = currentItem.index + 1
      nextRealIndex = list.findIndex(item => item.index == nextRealIndex)
      // 当最后一个item时，清空第一个item，这样就不会circular
      if (nextRealIndex == -1) {
        return null
      }
      const total = this.data.total != 0 ? this.data.total : list.length
      const item = nextRealIndex == total ? null : list[nextRealIndex]

      return item
    },
  },
})
