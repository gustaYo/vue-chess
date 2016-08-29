export const boardGameMove = makeAction('MOVE')
export const boardGameTurn = makeAction('TURN')
export const boardGameCountDown = makeAction('COUNTDOWN')
function makeAction (type) {
  return ({ dispatch }, ...args) => dispatch(type, ...args)
}
