
Page({
  
  onBack(e) {
    console.log('onBack e: ', e)
    const { preventDefault, next } = e.detail
    preventDefault()
    setTimeout(() => {
      next((...args) => {
        console.log('onBack next args: ', args)
      })
    }, 10000)
  }
})