module.exports = function createKeyEvent (type, key, modifiers) {
  modifiers = modifiers || {}

  const opts = {
    shiftKey: modifiers.shift || false,
    metaKey: modifiers.meta || false,
    altKey: modifiers.alt || false,
    ctrlKey: modifiers.ctrl || false,
    key: key,
    keyIdentifier: key
  }

  const modStr = Object
    .keys(modifiers)
    .map(k => k === 'ctrl' ? 'control' : k)
    .map(k => `${k[0].toUpperCase()}${k.substr(1)}`)

  let e
  try {
    e = new window.KeyboardEvent(type, opts)
  } catch (_) {
    e = document.createEvent('KeyboardEvent')
    e.initKeyboardEvent(type, true, true, window, key, key, modStr, null, null)
  }
  return e
}

