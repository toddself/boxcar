const keyFromEvent = require('./key-from-event')

module.exports = function gridKeyDown (evt, inEdit, chooRoot, send) {
  const key = keyFromEvent(evt)
  switch (key) {
    case 'Tab':
    case 'ShiftTab':
    case 'ArrowLeft':
    case 'ArrowRight':
    case 'ArrowUp':
    case 'ArrowDown':
      send(`${chooRoot}:move`, {key: key})
      break
    case 'Enter':
      if (inEdit) {
        send(`${chooRoot}:commit`, {value: evt.target.value})
      } else {
        send(`${chooRoot}:edit`)
      }
      break
    case 'Escape':
      if (inEdit) {
        send(`${chooRoot}:revert`)
      }
  }
}

