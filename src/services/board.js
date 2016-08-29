import Storage from './lstorage'
export default {
  filter (ctx, data) {
    return ctx.$http.post(Storage.get('serverDir') + '/board/filter', data)
  },
  boardParms: Storage.get('parmsBoard'),
  setParms: function (parms) {
    this.boardParms = parms
    Storage.set('parmsBoard', parms)
  }
}

