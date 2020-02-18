
class RepostEntry {
  constructor() {
    this.chatId = 0
    this.messageId = 0
    this.userId = 0
    this.buttonId = 0
  }
}

class ReactionsButton {
  constructor(key) {
    this.key = key
  }
}

class ReactionsKeyboardSettings {
  constructor(numberOfColumns) {
    this.numberOfColumns = numberOfColumns
  }
}

class ReactionsKeyboardDataEntry {
  constructor(inSettings, buttons) {
    this.settings = inSettings
    this.buttons = buttons
  }
}
class InlineKeyboardMarkup {
  constructor() {
    this.inline_keyboard = []
  }
}

class ReactionsKeyboard {
  constructor(inSettings, inButtons) {
    this.settings = inSettings
    this.buttons = inButtons.map(x => new ReactionsButton(x))
  }

  static buildMarkup(user, keyboard) {
    let inline_keyboard = []
    inline_keyboard.push(
      [
        {
          text: `@${user.username}`,
          url: `https://t.me/${user.username}`
        }
      ]
    );
    let buttons = null
    for (let x = 0; x < keyboard.buttons.length; x++) {
      let y = x % keyboard.settings.numberOfColumns
      if (y == 0) {
        if (buttons != null) {
          inline_keyboard.push(buttons)
        }
        buttons = []
      }
      let keyButton = keyboard.buttons[x]
      buttons.push({
        text: keyButton[1] != 0
          ? `${keyButton[0].key} ${keyButton[1]}`
          : `${keyButton[0].key}`,
        callback_data: '' + x
      })
    }
    inline_keyboard.push(buttons)
    return { inline_keyboard: inline_keyboard }
  }

  static makeDefaultDataEntry(keyboard) {
    return new ReactionsKeyboardDataEntry(keyboard.settings, keyboard.buttons.map(x => [x, 0]))
  }
}

module.exports = {
  RepostEntry, ReactionsKeyboardDataEntry, ReactionsKeyboardSettings,
  ReactionsButton, ReactionsKeyboard
}
