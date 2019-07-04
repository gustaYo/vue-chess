import Storage from './lstorage'
export default {
  add (ctx, data) {
    return ctx.$http.post(Storage.get('serverDir') + '/puzzle', data).then(r => {
      if (r.status === 200) {
        return r.text()
      } else {
        return r.text().then(d => {
          throw d
        })
      }
    })
  },
  del (ctx, data) {
    return ctx.$http.delete(Storage.get('serverDir') + '/puzzle/del/' + data).then(r => {
      if (r.status === 200) {
        return r.text()
      } else {
        return r.text().then(d => {
          throw d
        })
      }
    })
  },
  get (ctx, data) {
    return ctx.$http.post(Storage.get('serverDir') + '/puzzle/get', data).then(r => {
      if (r.status === 200) {
        return r.text()
      } else {
        return r.text().then(d => {
          throw d
        })
      }
    })
  },
  count (ctx) {
    return ctx.$http.get(Storage.get('serverDir') + '/puzzle/get').then(r => {
      if (r.status === 200) {
        return r.text()
      } else {
        return r.text().then(d => {
          throw d
        })
      }
    })
  },
  resolve (ctx, data) {
    return ctx.$http.put(Storage.get('serverDir') + '/puzzle/get', data).then(r => {
      if (r.status === 200) {
        return r.text()
      } else {
        return r.text().then(d => {
          throw d
        })
      }
    })
  }
}
