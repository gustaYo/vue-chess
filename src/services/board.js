import Storage from './lstorage'
export default {
  filter (ctx, data) {
    return ctx.$http.post(Storage.get('serverDir') + '/board/filter', data).then(r => {
      if (r.status === 200) {
        return r.text()
      } else {
        return r.text().then(d => {
          throw d
        })
      }
    })
  },
  stats (ctx, data) {
    return ctx.$http.get(Storage.get('serverDir') + '/board/stats' + this.urlGetParms(data)).then(r => {
      if (r.status === 200) {
        return r.text()
      } else {
        return r.text().then(d => {
          throw d
        })
      }
    })
  },
  urlGetParms (data) {
    var parms = '?'
    for (var key in data) {
      parms += (parms === '?' ? '' : '&') + key + '=' + data[key]
    }
    return parms
  },
  boardParms: Storage.get('parmsBoard'),
  setParms (parms) {
    this.boardParms = parms
    Storage.set('parmsBoard', parms)
  }
}

