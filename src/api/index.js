const config = require('../config')

if (config.mode == 'sync') {
  var { fetchUpdates } = require('./fetchUpdatesSync')
} else {
  var { fetchUpdates } = require('./fetchUpdatesAsync')
}

let { doGenericApiCall, Functions } = require('./main')

let id = -1
doGenericApiCall(Functions.getMe).then(data => {
  id = data.id
})


module.exports = {
  doGenericApiCall,
  Functions,
  fetchUpdates,
  getId: () => id,
  User: () => {
    return {
      id: 0,
      is_bot: false,
      first_name: '',
      last_name: '',
      username: '',
      language_code: ''
    }
  }
}
