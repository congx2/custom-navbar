
const imageCDNPath = 'https://ucmp-wx-static-sit.sf-express.com/sfoss/ad-act/wxapp/'

Component({

  data: {
    imageCDNPath,
    isTrackable: false
  },

  lifetimes: {
    attached() {
      // https://ucmp-wx-static-sit.sf-express.com/sfoss/ad-act/wxapp/ar-test-assets/ar-test-box5.glb
      this.settings = null
    }
  },

  methods: {
    setTrackable(trackable) {
      const isTrackable= !!trackable
      this.setData({ isTrackable })
    },

    setSettings(settings) {
      this.settings = settings
    },

    start(settings) {
      this.setSettings(settings)
    },

    updateTrackers() {
      const { markers } = this.settings
      let trackers = []
      if (!Array.isArray(markers)) {
        trackers = []
      } else {
        trackers = markers.map((src, i) => {
          const id = `marker-${i + 1}`
          return { id, src}
        })
      }
      this.setData({ trackers })
    }
  }
})