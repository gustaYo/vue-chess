import {} from '../mutation-types'
const state = {
  user: {}
}
const mutations = {
  SETUSER (state, newValue, key) {
    if (key) {
      state.user[key] = newValue
    } else {
      state.user = newValue
    }
  }
}

export default {
  state,
  mutations
}
