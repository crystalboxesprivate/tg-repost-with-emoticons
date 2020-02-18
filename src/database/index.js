const config = require('../config')

if (config.dbType == 'mongo') {
  var applicationState = require('./mongo')
} else {
  var applicationState = require('./json')
}

module.exports = applicationState