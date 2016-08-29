import Storage from './lstorage'
export default {
  add (ctx, data) {
    return ctx.$http.post(Storage.get('serverDir') + '/puzzle', data)
  },
  del (ctx, data) {
    return ctx.$http.delete(Storage.get('serverDir') + '/puzzle/del/' + data)
  },
  get (ctx, data) {
    return ctx.$http.post(Storage.get('serverDir') + '/puzzle/get', data)
  }
}
