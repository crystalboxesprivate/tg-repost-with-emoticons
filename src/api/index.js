const config = require('../config')
if (config.mode == 'sync') {
  var { fetchUpdates } = require('./fetchUpdatesSync')
}
let { doGenericApiCall, Functions } = require('./main')

module.exports = {
  doGenericApiCall,
  Functions,
  fetchUpdates
}
