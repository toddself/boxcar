'use strict'
const getActiveCellContents = require('../lib/get-active-cell-contents')
const dcTimeout = 750
let dcTimer = null

function getMove (chooRoot) {
  return function move (action, state, send) {
    let setEdit = false
    if (state.inEdit) {
      send(`${chooRoot}:updateData`, {value: state.scratch || getActiveCellContents(state)})
      send(`${chooRoot}:unsetEdit`)
      if (action.key.includes('Tab')) {
        setEdit = true
      }
    }

    let col = state.activeCell.col
    let row = state.activeCell.row
    if (action.mouse) {
      if (col === action.col && row === action.row && dcTimer !== null) {
        window.clearTimeout(dcTimer)
        dcTimer = null
        setEdit = true
      } else {
        col = action.col
        row = action.row
        window.clearTimeout(dcTimer)
        dcTimer = window.setTimeout(() => {
          dcTimer = null
        }, dcTimeout)
      }
    }

    const active = {row: row, col: col}
    const maxCol = state.header.length - 1
    const maxRow = state.data.length - 1
    switch (action.key) {
      case 'Tab':
      case 'ArrowRight':
        active.col += 1
        if (active.col >= maxCol) {
          active.col = maxCol
        }

        break
      case 'ShiftTab':
      case 'ArrowLeft':
        active.col -= 1
        if (active.col < 0) {
          active.col = 0
        }
        break
      case 'ArrowUp':
        active.row -= 1
        if (active.row < 0) {
          active.row = 0
        }
        break
      case 'ArrowDown':
        active.row += 1
        if (active.row >= maxRow) {
          active.row = maxRow
        }
        break
    }
    send(`${chooRoot}:setActive`, active)
    if (setEdit) {
      send(`${chooRoot}:edit`)
    }
  }
}

module.exports = getMove
