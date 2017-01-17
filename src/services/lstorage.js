export default {
  prefix: 'appName',
  lStorage: window.localStorage,
  setPrefix (name) {
    this.prefix = name
  },
  get (name, value = false) {
    if (this.lStorage.getItem(this.prefix + '-' + name)) {
      return JSON.parse(this.lStorage.getItem(this.prefix + '-' + name))
    } else {
      return this.set(name, value)
    }
  },
  set (name, data) {
    this.lStorage.setItem(this.prefix + '-' + name, JSON.stringify(data))
    return this.get(name)
  },
  del (name) {
    this.lStorage.removeItem(this.prefix + '-' + name)
  },
  clearLocal (reload = false) {
    var prefixRegex = new RegExp('^' + this.prefix)
    var store = this.lStorage
    Object.keys(store).forEach((key) => {
      if (prefixRegex.test(key)) {
        store.removeItem(key)
      }
    })
    if (reload) {
      window.location.reload()
    }
  }
}
