const MongoClient = require('mongodb').MongoClient
const config = require('../../config')
let mongodb

module.exports = {
  setup: callback => {
    const uri = config.mongoUrl
    MongoClient.connect(uri, {
      useNewUrlParser: true, useUnifiedTopology: true
    },
      (err, client) => {
        mongodb = client.db(config.dbName)
        if (err) {
          callback(err)
        } else {
          return callback('database connection established')
        }
      })
  },
  get: () => {
    return mongodb
  }
}
