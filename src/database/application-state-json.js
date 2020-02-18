const api = require('../api')
let utils = require('./utils')
const fs = require('fs')

const { RepostEntry, ReactionsKeyboard } = require('../reactions')

let data = {
  reposts: {},
  reactionEntries: []
}

let repostsHasKey = key => {
  let contains = false
  Object.entries(data.reposts).forEach(x => {
    if (x[0] == key) {
      contains = true
    }
  })
  return contains
}

let containsReactionEntry = reactionEntry => {
  let contains = false
  data.reactionEntries.forEach(x => {
    if (x.chatId == reactionEntry.chatId &&
      x.messageId == reactionEntry.messageId &&
      x.userId == reactionEntry.userId &&
      x.buttonId == reactionEntry.buttonId) {
      contains = true
    }
  })
  return contains
}

let removeReactionEntry = entry => {
  let index = -1
  for (let x = 0; x < data.reactionEntries.length; x++) {
    if (entry == data.reactionEntries[x]) {
      index = x
    }
  }
  data.reactionEntries.splice(index, 1)
}

module.exports = {
  getRepostAuthor: (chatId, messageId) => {
    let postAuthor = null
    let key = utils.makeRepostsKey(chatId, messageId)
    if (repostsHasKey(key)) {
      postAuthor = data.reposts[key].user
    }
    return postAuthor
  },
  hasRepostInDatabase: (chatId, messageId) => {
    return repostsHasKey(utils.makeRepostsKey(chatId, messageId))
  },
  clearReactionsForPost: (chatId, messageId) => {
    let idxToRemove = []
    data.reactionEntries.filter(y => y.chatId == chatId && y.messageId == messageId).forEach(
      x => {
        for (let i = 0; i < data.reactionEntries.length; i++) {
          if (data.reactionEntries[i] == x) {
            idxToRemove.push(i)
          }
        }
      })
    idxToRemove.forEach(i => data.reactionEntries.splice(i, 1))
  },
  swapKeyboard: (chatId, messageId, keyboardDataEntry) => {
    let key = utils.makeRepostsKey(chatId, messageId)
    if (!repostsHasKey(key)) {
      return
    }
    var entry = data.reposts[key]
    entry.dataEntry = keyboardDataEntry
    data.reposts[key] = entry
  },
  getReactionKeyboardData: (chatId, messageId) => {
    var key = utils.makeRepostsKey(chatId, messageId);
    if (repostsHasKey(key)) {
      var entry = data.reposts[key];
      keyboardCounts = entry.dataEntry.buttons.map(x => x[1])
      postAuthor = entry.user;
      return [keyboardCounts, postAuthor, true]
    }
    return [null, {}, false]
  },
  updateReactionEntry: (chatId, messageId, userId, buttonNumber) => {
    let entry = new RepostEntry()
    entry.chatId = chatId
    entry.messageId = messageId
    entry.userId = userId
    entry.buttonId = buttonNumber

    let containsEntry = containsReactionEntry(entry)
    counterDiffValue = containsEntry ? -1 : 1;

    if (containsEntry) {
      removeReactionEntry(entry)
    }
    else {
      data.reactionEntries.push(entry);
    }
    return counterDiffValue
  },
  updateKeyboardCounts: (chatId, messageId, keyboardCounts) => {
    let key = utils.makeRepostsKey(chatId, messageId);
    let entry = data.reposts[key];
    for (let x = 0; x < keyboardCounts.length; x++) {
      let button = entry.dataEntry.buttons[x];
      entry.dataEntry.buttons[x] = [button[0], keyboardCounts[x]];
    }
    keyboardDataEntry = entry.dataEntry
    data.reposts[key] = entry
    return keyboardDataEntry
  },
  addRepostEntry: (repostEntry) => {
    data.reposts[utils.makeRepostsKey(repostEntry.chatId, repostEntry.messageId)] = {
      user: repostEntry.user,
      source: repostEntry.source,
      dataEntry: ReactionsKeyboard.makeDefaultDataEntry(repostEntry.keyboard)
    };
  },
  serialize: async () => {
    return new Promise((resolve, reject) => {
      fs.writeFile("./db.json", JSON.stringify(data), function (err) {
        if (err) {
          console.log(err)
        }
        resolve()
      })
    })
  },
  deserialize: async () => {
    return new Promise((resolve, reject) => {
      fs.readFile('./db.json', (err, d) => {
        if (err) {
          console.log(err)
          resolve()
          return
        }
        data = JSON.parse(d)
        resolve()
        return
      })
    })
  }
}
