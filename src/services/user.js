import Storage from './lstorage'
export default {
  authenticate (ctx, data) {
    return ctx.$http.post(Storage.get('serverDir') + '/user/authenticate', data)
  },
  signin (ctx, data) {
    return ctx.$http.post(Storage.get('serverDir') + '/user/signin', data)
  },
  user: null,
  getUser () {
    return Storage.get('user')
  },
  setUser (newUser) {
    this.user = Storage.set('user', newUser)
  },
  logout () {
    Storage.clearLocal(true)
    this.user = null
  },
  init () {
    this.user = Storage.get('user')
  },
  user_acces (perm = 'authenticate') {
    if (this.getUser() && perm !== 'authenticate') {
      return this.user.rol === perm
    }
    if (perm === 'authenticate') {
      if (this.getUser()) {
        return true
      }
    }
    return false
  }
}
