require('dotenv').config()
const api = require('./api')
const config = {
  address: process.env.API_ADDRESS,
  token: process.env.API_TOKEN,
  mode: process.env.MODE || "async",
  numberOfKeyboardColumns: 3,
  appAddress: process.env.ADDRESS,
  port: process.env.PORT || 3000,
  webhookToken: process.env.WEBHOOK_TOKEN || 'tgWebhook',
  dbType: process.env.DB_TYPE || 'json',
  dbName: process.env.DB_NAME || 'repostbot',
  mongoUrl: process.env.MONGO_URL
}

module.exports = config
