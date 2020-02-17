const api = require('./main')

let updatesHandler = null
let currentOffset = 0

let fetchUpdates = callback => {
  updatesHandler = callback

  if (updatesHandler == null) {
    return
  }

  let getUpdates = async () => {
    while (true) {
      let data = await api.doGenericApiCall(api.Functions.getUpdates, { offset: currentOffset }).catch(err => console.error(err))
      if (typeof data === 'string') { data = JSON.parse(data) }
      callback(data)
      // need to bump the offset so the value isn't the same anymore
      commitUpdates(data.result)
      if (updatesHandler == null) {
        break
      }
    }
  }
  getUpdates()
}

let commitUpdates = updates => {
  if (updates.length < 1) {
    return
  }
  currentOffset = updates.slice(-1)[0].update_id + 1
}

module.exports = {
  fetchUpdates
}

