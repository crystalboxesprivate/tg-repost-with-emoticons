let config = require('../config')
let fromEntries = require('fromentries')
const request = require('request')
request.shouldKeepAlive = false

let getApiUrl = methodName => `${config.address}/bot${config.token}/${methodName}`
let doGenericApiCall = async (name, data) => {
  return new Promise((resolve, reject) => {
    request.post(getApiUrl(name),
      { json: data }, (err, res, body) => {
        if (err) {
          reject(err)
        } else {
          resolve(body)
        }
      })
  })
}

let functionNames = ['getUpdates']
let Functions = fromEntries(functionNames.map(x => [x, x]))

module.exports = {
  doGenericApiCall, Functions
}