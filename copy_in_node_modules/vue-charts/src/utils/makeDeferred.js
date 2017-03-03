/*
    This lets us resolve the promise outside the
    promise function itself.
 */
export function makeDeferred () {
  let resolvePromise = null
  let rejectPromise = null

  let promise = new Promise((resolve, reject) => {
    resolvePromise = resolve
    rejectPromise = reject
  })

  return {
    promise: promise,
    resolve: resolvePromise,
    reject: rejectPromise
  }
}

export default makeDeferred
