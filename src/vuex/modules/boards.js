import {} from '../mutation-types'
const state = {
  pgn: 'none',
  turn: 'none',
  twhite: 60 * 1,
  tblack: 60 * 1
}
const mutations = {
  MOVE (state, newPgn) {
    state.pgn = newPgn
  },
  TURN (state, turnNow) {
    state.turn = turnNow
  },
  COUNTDOWN (state, time, color) {
    state['t' + color] = time
  }
}

export default {
  state,
  mutations
}

