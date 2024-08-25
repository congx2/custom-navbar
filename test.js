
function omit(obj, ...keys) {
  const props = [].concat.apply([], keys)
  const omits = props.reduce((acc, item) => {
    acc[item] = true
    return acc
  }, {})
  return Object.keys(obj).reduce((acc, item) => {
    return omits[item] ? acc : Object.assign(acc, { [item]: obj[item] })
  }, {})
}

const obj = {
  name: 'tesla',
  price: '30w',
  num: 20
}

const obj2 = omit(obj, ['name', 'price', 'ok'])

console.log(obj2)