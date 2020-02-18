let api = require('./api')
let assert = require('assert')
let applicationState = require('./application-state')
let reactions = require('./reactions')
let config = require('./config')
const { ReactionsKeyboard, ReactionsKeyboardSettings } = reactions

const defaultKeyboard = new ReactionsKeyboard(
  new ReactionsKeyboardSettings(config.numberOfKeyboardColumns),
  ["👍🏾", "👎🏾", "✋🏾", "👳🏾", "👩🏾‍", "🤴‍"])

const helpMessage = `Dear user. Read this carefully. This bot reposts user posted images and attaches an Inline panel of 'reaction buttons' which makes it possible to leave reactions to the post. Each command must start with ! character. 
Supported commands:
!help: prints this message.
!keyboard: Make sure the message replies to the valid repost. Type new set of buttons separated with ' ' character. e.g. !keyboard 👲 🐻";`

let processCommands = async updates => {
  let sendMessage = async (chat, text) => {
    await api.doGenericApiCall(api.Functions.sendMessage, {
      chat_id: chat, text: text
    })
  }
  const startCommandToken = '!'
  const maxKeyboardTokenSize = 15;

  const validCommands = {
    help: chatId => sendMessage(chatId, helpMessage),
    keyboard: async (chatId, tokens, message) => {
      if (tokens.length <= 1) {
        sendMessage(chatId, "Error. To replace the keyboard, write a new set of buttons separated by space.")
        return
      }

      if (message.reply_to_message == null) {
        sendMessage(chatId, "Error. Expected a reply message.")
      }

      let replyMessage = message.reply_to_message
      if (replyMessage.from.id != api.getId()) {
        // The bot tells that it needs the message posted by him. Not by someone else
        sendMessage(chatId,
          "Error. Expected a repost message sent by this bot.");
        return
      }

      let repostAuthor = applicationState.getRepostAuthor(replyMessage.chat.id, replyMessage.message_id);
      if (!applicationState.hasRepostInDatabase(replyMessage.chat.id, replyMessage.message_id)) {
        // Write in the console that it caught an invalid message.
        sendMessage(chatId,
          "Error. Couldn't update the keyboard. The specified post is likely not stored in the database thus can't be modified.");
        return
      }

      let keyboardButtons = []
      for (let index = 1; index < tokens.length; index++) {
        let token = tokens[index]
        if (token.length > maxKeyboardTokenSize) {
          // Bot returns error which says about key length limit
          sendMessage(chatId,
            `Error. Only key tokens of length: ${maxKeyboardTokenSize} are allowed.`);
          return
        }
        keyboardButtons.push(token)
      }
      applicationState.clearReactionsForPost(replyMessage.chat.id, replyMessage.message_id);

      let keyboardDataEntry = ReactionsKeyboard.makeDefaultDataEntry(
        new ReactionsKeyboard(
          new ReactionsKeyboardSettings(config.numberOfKeyboardColumns),
          keyboardButtons
        ));

      applicationState.swapKeyboard(replyMessage.chat.id, replyMessage.message_id,
        keyboardDataEntry);

      // TODO need to fetch complete repost data to be able 
      // to apply the correct settings.
      // Use defaults for now.
      let keyboardMarkup = ReactionsKeyboard.buildMarkup(repostAuthor,
        keyboardDataEntry);

      await api.doGenericApiCall('editMessageReplyMarkup', {
        chat_id: replyMessage.chat.id,
        message_id: replyMessage.message_id,
        reply_markup: keyboardMarkup
      })
    }
  }

  assert(updates != null)
  updates.map(x => x.message).filter(y => y != null && y.text != null).forEach(message => {
    if (!message.text.startsWith(startCommandToken)) {
      return
    }
    let chatId = message.chat.id
    let tokens = message.text.split(' ')
    let commandName = tokens[0].replace('!', '')
    if (!Object.keys(validCommands).includes(commandName)) {
      sendMessage(chatId,
        "User. type !help if you are having trouble putting pieces together what this thing is for.");
      return
    }
    validCommands[commandName](chatId, tokens, message)
  });
}

let processCallbackQueries = async updates => {
  updates
    .map(x => x.callback_query)
    .filter(y => y != null)
    .forEach(async callback => {
      let user = callback.from

      let chatId = callback.message.chat.id
      let messageId = callback.message.message_id
      let buttonId = parseInt(callback.data)

      let [keyboardCounts, repostAuthor, success] = applicationState.getReactionKeyboardData(chatId, messageId)

      if (!success) {
        console.log(`Entry ${chatId}:${messageId} doesn't exist in the database.`);
        return
      }
      let counterValue = applicationState.updateReactionEntry(chatId, messageId, user.id, buttonId)
      assert(buttonId < keyboardCounts.length)
      keyboardCounts[buttonId] += counterValue

      let updatedDataEntry = applicationState.updateKeyboardCounts(chatId, messageId, keyboardCounts)

      // send updated message to server
      let keyboardMarkup = ReactionsKeyboard.buildMarkup(repostAuthor, updatedDataEntry);

      await api.doGenericApiCall('editMessageReplyMarkup', {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: keyboardMarkup
      })
    })
}

let MediaType = {
  photo: 0,
  unknown: 2
}

let ApiResultHandler = {
  getMessageMediaType: message => {
    if (message != null) {
      if (message.photo != null) {
        return MediaType.photo // photo
      }
    }
    return MediaType.unknown // unknown
  },
  isMessageOlderThan: (msg, seconds) => {
    const now = new Date()
    const secondsSinceEpoch = Math.round(now.getTime() / 1000)
    return secondsSinceEpoch - msg.date > seconds
  },
  MediaType
}

let handleRepostOperation = async updates => {
  if (updates == null) { return }
  let isMessageWithMediaAttached = upd => {

    return ApiResultHandler.getMessageMediaType(upd.message) != 2
  }
  let updatesWithMedia = updates.filter(x => isMessageWithMediaAttached(x))
  if (updatesWithMedia.length == 0) { return }

  updatesWithMedia.map(a => a.message).forEach(async message => {
    if (message.from.is_bot) {
      return
    }
    let mediaType = ApiResultHandler.getMessageMediaType(message)

    if (ApiResultHandler.isMessageOlderThan(message, 60)) {
      console.log(`Ignoring stale message ${mediaType} (${message.message_id})`)
      return;
    }

    assert(mediaType != ApiResultHandler.MediaType.unknown)

    var keyboardMarkup = ReactionsKeyboard.buildMarkup(message.from,
      ReactionsKeyboard.makeDefaultDataEntry(defaultKeyboard));

    let resultMessage = null

    switch (mediaType) {
      case ApiResultHandler.MediaType.photo:
        {
          assert(message.photo.length > 0);
          await api.doGenericApiCall('deleteMessage', {
            chat_id: message.chat.id,
            message_id: message.message_id
          })

          resultMessage = await api.doGenericApiCall('sendPhoto', {
            chat_id: message.chat.id,
            photo: message.photo[0].file_id,
            reply_markup: keyboardMarkup
          })
        }
        break;
      default: return;
    }

    assert(resultMessage.message_id != 0);

    applicationState.addRepostEntry({
      keyboard: defaultKeyboard,
      messageId: resultMessage.message_id,
      chatId: resultMessage.chat.id,
      source: "",
      user: message.from
    })
  })
  console.log(
    `Updates with media: ${updatesWithMedia.length}.`);
}

api.fetchUpdates(async updates => {
  processCommands(updates)
  processCallbackQueries(updates)
  handleRepostOperation(updates)
})
