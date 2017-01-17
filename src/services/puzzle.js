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
  },
  count (ctx) {
    return ctx.$http.get(Storage.get('serverDir') + '/puzzle/get')
  },
  resolve (ctx, data) {
    return ctx.$http.put(Storage.get('serverDir') + '/puzzle/get', data)
  }
}
