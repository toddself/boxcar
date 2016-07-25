'use strict'
const series = require('run-series')
const getActiveCellContents = require('../lib/get-active-cell-contents')
const dcTimeout = 750
let dcTimer = null

function getMove (chooRoot) {
  return function move (action, state, send, done) {
    let setEdit = false
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

    const ops = [send.bind(send, `${chooRoot}:setActive`, active)]

    if (state.inEdit) {
      const data = state.scratch || getActiveCellContents(state)
      const updateData = send.bind(send, `${chooRoot}:updateData`, {value: data})
      const unsetEdit = send.bind(send, `${chooRoot}:unsetEdit`)
      ops.unshift(updateData, unsetEdit)
      if (action.key.includes('Tab')) {
        setEdit = true
      }
    }

    if (setEdit) {
      ops.push(send.bind(send, `${chooRoot}:edit`))
    }

    series(ops, done)
  }
}

module.exports = getMove
