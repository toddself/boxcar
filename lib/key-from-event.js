'use strict'

require('string.fromcodepoint')

// IE and older Firefox use an older version of the spec, so we have to
// normalize the answers to the latest version. And Safari doesn't even
// support it (WebKit Bugzilla #36267), so we use it's `keyIdentifier` field
const keyMap = {
  'U+0009': 'Tab', // safari
  'U+001B': 'Escape', // safari
  'U+0008': 'Delete', // safari
  'Esc': 'Escape',
  'Left': 'ArrowLeft',
  'Right': 'ArrowRight',
  'Up': 'ArrowUp',
  'Down': 'ArrowDown',
  'Del': 'Delete'
}

const actionKeys = Object.keys(keyMap).map(k => keyMap[k]).concat(['Enter'])

module.exports = function (evt) {
  const key = evt.key || evt.keyIdentifier
  const mappedKey = keyMap[key] || key

  if (actionKeys.indexOf(mappedKey) === -1) {
    let character = key || ''
    if (character.indexOf('U+') === 0) {
      character = String.fromCodePoint(parseInt(key.substr(2), 16))
    }
    if (!evt.shiftKey) {
      character = character.toLowerCase()
    }
    return character
  }

  let action = mappedKey
  if (evt.shiftKey && mappedKey !== 'Shift') {
    action = `Shift${action}`
  }

  if (evt.ctrlKey && mappedKey !== 'Control') {
    action = `Ctrl${action}`
  }

  if (evt.metaKey && mappedKey !== 'Meta') {
    action = `Meta${action}`
  }

  if (evt.altKey && mappedKey !== 'Alt') {
    action = `Alt${action}`
  }

  return action
}
