import { usePromise, delay } from './shared.js'
const imageCDNPath = 'https://ucmp-wx-static-sit.sf-express.com/sfoss/ad-act/wxapp/'


Page({

  data: {
    arCompo: {
      width: 0,
      height: 0,
      styleWidth: 0,
      styleHeight: 0
    }
  },

  onLoad() {
    const info = wx.getSystemInfoSync()
    const { pixelRatio, windowHeight, windowWidth } = info
    const width = Math.floor(windowWidth * pixelRatio)
    const height = Math.floor(windowHeight * pixelRatio)
    const styleWidth = Math.floor(windowWidth * 1)
    const styleHeight = Math.floor(windowHeight * 1)
    this.setData({ arCompo: { width, height, styleWidth, styleHeight } })
  },

  onReady() {
    this.ARCompo = this.selectComponent('#ar-marker-2d')
    console.log('ARCompo: ', this.ARCompo)
  },

  getMockData() {
    return delay(500).then(() => ({
      markers: [
        `${imageCDNPath}ar-test-assets/sl-logo-bg-white.png`,
        `${imageCDNPath}ar-test-assets/sl-logo-bg-black.png`
      ],
      gltfSrc: `${imageCDNPath}ar-test-assets/ar-test-box5.glb`,
      scanVideoSrc: `${imageCDNPath}ar-test-assets/ar-test-scan-logo.mp4`,
      runnigManVideoSrc: `${imageCDNPath}ar-test-assets/ar-test-xg-run.mp4`
    }))
  }

})