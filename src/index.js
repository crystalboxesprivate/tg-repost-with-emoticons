let api = require('./api')
let assert = require('assert');

const startCommandToken = '!'

let processCommands = updates => {
  let sendMessage = (chat, text) => {
    api.doGenericApiCall(api.Functions.sendMessage, {
      chat_id: chat, text: text
    })
  }
  assert(updates != null)
  updates.map(x => x.message).filter(y => y.text != null).forEach(message => {
    if (!message.text.startsWith(startCommandToken)) {
      return
    }
    else {
      console.log('received token')
      
    }
  });
}


api.fetchUpdates(data => {
  console.log(data)
  processCommands(data.result)
  // proces commands
})
