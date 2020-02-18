const db = require('./connection')
const ObjectId = require('mongodb').ObjectId

module.exports = {
  serialize: async () => { },
  deserialize: async () => {
    db.setup()
    var repo = {
      reposts: db.get().collection('reposts'),
      reactions: db.get().collection('reactions')
    }
  },
  addRepostEntry: repostEntry => {
    //TODO 
  },
  getRepostAuthor: (chatId, messageId) => {
    //TODO 
  },
  hasRepostInDatabase: (chatId, messageId) => {
    //TODO 
  },
  clearReactionsForPost: (chatId, messageId) => {
    //TODO 
  },
  swapKeyboard: (chatId, messageId, keyboardDataEntry) => {
    //TODO 
  },
  getReactionKeyboardData: (chatId, messageId) => {
    //TODO 
  },
  updateReactionEntry: (chatId, messageId, userId, buttonNumber) => {
    //TODO 
  },
  updateKeyboardCounts: (chatId, messageId, keyboardCounts) => {
    //TODO 
  },
}
