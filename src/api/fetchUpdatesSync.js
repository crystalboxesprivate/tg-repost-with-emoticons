const api = require('./main')
const applicationState = require('../database/application-state-json')

let updatesHandler = null
let currentOffset = 0

let fetchUpdates = callback => {
  updatesHandler = callback

  if (updatesHandler == null) {
    return
  }

  let getUpdates = async () => {
    await applicationState.deserialize()
    while (true) {
      let data = await api.doGenericApiCall(api.Functions.getUpdates, { offset: currentOffset }).catch(err => console.error(err))
      if (typeof data === 'string') {
        data = JSON.parse(data)
      }
      await callback(data)
      // need to bump the offset so the value isn't the same anymore
      commitUpdates(data)
      await applicationState.serialize()
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

