const api = require('./main')
const app = require('../server')
const config = require('../config')

let updatesCallback = null
let isListenerRunning = false

let fetchUpdates = async callback => {
  // setup webhook
  let webhookInfo = await api.doGenericApiCall('getWebhookInfo')
  if (webhookInfo.url != '') {
    await api.doGenericApiCall('deleteWebhook')
  }
  if (!isListenerRunning) {
    isListenerRunning = true
    app.post(`/${config.webhookToken}`, (req, res) => {
      updatesCallback([req.body])
    })
    app.get(`/${config.webhookToken}`, (req, res) => {
      res.send('Telegram')
    })
  }

  let whUrl = `https://${config.appAddress}/${config.webhookToken}`

  api.doGenericApiCall('setWebhook', {
    url: whUrl
  })

  updatesCallback = callback
}

module.exports = { fetchUpdates }
