const api = require('./main')

let updatesHandler = null
let currentOffset = 0

// TODO: Async mode
let fetchUpdates = callback => {
  updatesHandler = callback

  if (updatesHandler == null) {
    return
  }

  let getUpdates = async () => {
    while (true) {
      let data = await api.doGenericApiCall(api.Functions.getUpdates, { offset: currentOffset }).catch(err => console.error(err))
      callback(data)
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

