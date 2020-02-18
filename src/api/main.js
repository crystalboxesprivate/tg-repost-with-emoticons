let config = require('../config')
let fromEntries = require('fromentries')
const request = require('request')

let getApiUrl = methodName => `${config.address}/bot${config.token}/${methodName}`
let doGenericApiCall = async (name, data) => {
  return new Promise((resolve, reject) => {
    request.post(getApiUrl(name),
      { json: data }, (err, res, body) => {
        if (err) {
          console.error(`doGenericApiCall: ${err}`)
          reject(err)
        } else {
          if (typeof body === 'string') {
            try {
              body = JSON.parse(body)
            } catch (err) {
              reject(err)
            }
          }
          resolve(body.result)
        }
      })
  })
}

let functionNames = ['getUpdates', 'sendMessage', 'getMe', 'editMessageReplyMarkup']
let Functions = fromEntries(functionNames.map(x => [x, x]))

module.exports = {
  doGenericApiCall, Functions
}