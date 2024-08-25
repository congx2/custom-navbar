
import iconConfig from './icons.js'
import { omit, promisify, eventActionFactory } from './shared.js'
const imageCDNPath = 'https://ucmp-wx-static-sit.sf-express.com/sfoss/ad-act/wxapp/'

Component({
  options: {
    multipleSlots: true
  },

  properties: {
    cover: {
      type: Boolean,
      value: false,
    },

    icon: {
      type: String,
      optionalTypes: [Boolean],
      value: 'auto'
    },

    iconColor: {
      type: String,
      value: 'white'
    },

    backgroundColor: {
      type: String,
      value: 'transparent'
    },

    title: {
      type: String,
      optionalTypes: [Boolean],
      value: ''
    },

    titleColor: {
      type: String,
      value: '#00000'
    },

    homePath: {
      type: String,
      value: ''
    }
  },

  data: {
    imageCDNPath,
    statusBarHeight: 0,
    contentBarHeight: 0,
    iconBarWidth: 0,
    titleBarWidth: 0,
    rightMenuBarWidth: 0,
    leftMenuBtnStyle: '',
    menuBtnRect: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      width: 0,
      height: 0,
      radius: 0,
      topGap: 0,
      rightGap: 0
    },
    useSlotIconBox: false,
    useMenuIconBox: true,
    useTitleSlot: false,
    icons: [],
    titleText: ''
  },

  observers: {
    icon(value) {
      this.onIconChange(value)
    },

    title(value) {
      const useTitleSlot = value === false
      const titleText = typeof value === 'string' ? value : ''
      this.setData({ useTitleSlot, titleText })
    }
  },

  lifetimes: {
    created() {
      this.ICON_COLOR = { WHITE: 'white', BLACK: 'black' }
    },

    attached() {
      this.setLayoutInfo()
      this.onIconChange(this.properties.icon)
    },
  
    detached() {

    }
  },

  methods: {
    isValidStr(str) {
      return typeof str === 'string' && str.trim().length > 0
    },

    isTheFirstPage() {
      return this.getPages().length < 2
    },

    getStrValue(value, defaultValue) {
      return this.isValidStr(value) ? value.trim().toLowerCase() : defaultValue
    },

    getPages() {
      const pages = getCurrentPages()
      return Array.isArray(pages) ? pages : []
    },

    setLayoutInfo() {
      const win = wx.getWindowInfo()
      const rect = wx.getMenuButtonBoundingClientRect()
      const radius = Math.ceil(rect.height / 2)
      const topGap = rect.top - win.statusBarHeight
      const rightGap = win.screenWidth - rect.right
      const menuBtnRect = Object.assign({}, rect, { radius, topGap, rightGap })
      const menuBarWidth = menuBtnRect.width + 2 * menuBtnRect.rightGap
      const statusBarHeight = win.statusBarHeight
      const contentBarHeight = 2 * menuBtnRect.topGap + menuBtnRect.height
      const iconBarWidth = menuBarWidth
      const rightMenuBarWidth = menuBarWidth
      const titleBarWidth = win.screenWidth - 2 * menuBarWidth - 2 * menuBtnRect.rightGap
      const leftMenuBtnStyle = [
        `width:${menuBtnRect.width}px;`,
        `height:${menuBtnRect.height}px;`,
        `margin-left:${rightGap}px;`,
        `border-radius:${menuBtnRect.radius}px;`,
        `--border-radius:${menuBtnRect.height}px;`
      ].join('')
      this.setData({
        menuBtnRect,
        statusBarHeight,
        contentBarHeight,
        iconBarWidth,
        rightMenuBarWidth,
        titleBarWidth,
        leftMenuBtnStyle
      })
    },

    onIconChange(value) {
      if (value === false) {
        const useSlotIconBox = true
        const useMenuIconBox = !useSlotIconBox
        const icons = []
        this.setData({ useSlotIconBox, useMenuIconBox, icons })
        return
      }
      const result = this.parseIcon(value)
      const useSlotIconBox = false
      const useMenuIconBox = result.useMenuBtn
      const icons = result.btnNames.map(item => {
        return this.getIconOptions(item)
      }).filter(Boolean)
      this.setData({ useSlotIconBox, useMenuIconBox, icons })
    },

    onTapMenuIcon: eventActionFactory({
      store(payload) {
        const { event } = payload
        const { index } = event.currentTarget.dataset || {}
        const conf = this.data.icons[index]
        const icon = conf && conf.name ? { ...conf } : null
        const handlers = {
          [iconConfig.back.name]: this.back.bind(this),
          [iconConfig.home.name]: this.gohome.bind(this),
        }
        const handler = icon ? handlers[icon.name] : null
        return { icon, handler }
      },

      breaker(payload) {
        const { store } = payload
        return !store.icon
      },

      emit(payload) {
        console.log('emit payload: ', payload)
        const { store, preventDefault, next } = payload
        const name = store.icon.name
        const detail = Object.assign({}, store.icon, { preventDefault, next })
        this.triggerEvent(name, detail)
      },

      defaultAction(payload) {
        console.log('defaultAction payload: ', payload)
        const { event, store } = payload
        typeof store.handler === 'function' && store.handler.call(this, event)
      },

      customActionParams(payload) {
        console.log('customActionParams payload: ', payload)
        const { store } = payload
        return store.icon
      }
    }),

    getIconColor() {
      const { iconColor } = this.properties
      const { WHITE, BLACK } = this.ICON_COLOR
      if (!this.isValidStr(iconColor)) {
        return BLACK
      }
      return iconColor.trim().toLowerCase() === WHITE ? WHITE : BLACK
    },

    getIconOptions(name) {
      const conf = iconConfig[name]
      if (!conf) {
        return null
      }
      const { WHITE, BLACK } = this.ICON_COLOR
      const color = this.getIconColor()
      const icon = conf[color]
      const options = Object.assign({}, conf, { icon })
      return omit(options, WHITE, BLACK)
    },

    parseIcon(input) {
      const keywords = { auto: 'auto', menu: 'menu', back: 'back', home: 'home' }
      let icon = ''
      if (input === true) {
        icon = keywords.auto
      }
      if (typeof input !== 'string' || !input.trim().length) {
        icon = keywords.auto
      } else {
        icon = input.trim().toLowerCase()
      }
      const { home, back } = iconConfig 
      if (icon === keywords.auto) {
        const name = this.isTheFirstPage() ? home.name : back.name
        return {
          useMenuBtn: false,
          btnNames: [name]
        }
      }
      if (icon === keywords.menu) {
        return {
          useMenuBtn: true,
          btnNames: [back.name, home.name]
        }
      }
      const menuBtnReg = /menu\(([^\)]*)\)/
      const match = menuBtnReg.exec(icon)
      const useMenuBtn = !!match
      let names = match ? match[1] : icon
      let btnNames = []
      if (match && !names) {
          btnNames = [back.name, home.name]
          return { useMenuBtn, btnNames }
      }
      btnNames = names.split(/[,|]/).map(item => {
        const name = item.trim()
        return [home.name, back.name].includes(name) ? name : ''
      }).filter(Boolean)
      return { useMenuBtn, btnNames }
    },

    back() {
      return promisify(wx.navigateBack)()
    },

    gohome() {
      return promisify(wx.redirectTo)({ url: this.properties.homePath })
    }
  }

})