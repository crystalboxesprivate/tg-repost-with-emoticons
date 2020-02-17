let config = require('./config')

let getApiUrl = methodName => `${config.address}/bot${config.token}/${methodName}`
let send = async (name, data) => {
  return fetch(getApiUrl(name), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
}
let functionNames = ['getUpdates']
let Functions = Object.fromEntries(functionNames.map(x => [x, x]))

module.exports = {
  send,
  Functions
}
