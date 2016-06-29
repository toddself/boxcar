'use strict'

const choo = require('choo')
const v = choo.view
const connect = require('@toddself/throw-down/connect')

const grid = require('./styles.js')
const formElement = require('./lib/form-element')

function setFocus (node) {
  if (node.nodeName === 'INPUT') {
    node.setSelectionRange(node.value.length, node.value.length)
  }
}

function getEditor (cellData, cellConfig, isActive, inEdit, row, col, chooRoot, send) {
  let $el
  if (inEdit) {
    const params = {
      class: `${grid} ${isActive ? 'active' : ''} cell-content cell-editor`,
      autofocus: true,
      value: cellData
    }

    const actions = {
      oninput: (evt) => send(`${chooRoot}:updateScratch`, {value: evt.target.value}),
      onchange: (evt) => {
        console.log('sending on change', evt.target.value)
        send(`${chooRoot}:commit`, {value: evt.target.value})
      }
    }
    $el = formElement(cellConfig.editorType, params, actions, cellConfig.options)
  } else {
    if (cellConfig.editorType === 'select') {
      const opt = cellConfig.options.find(d => d.value === cellData)
      console.log('options for select', opt, cellData)
      cellData = opt && opt.name || cellData
    }

    $el = v`<span
      onclick=${() => send(`${chooRoot}:move`, {mouse: true, row: row, col: col, key: ''})}
      class="${grid} ${isActive ? 'active' : ''} cell-content cell-data">
        ${cellData}
      </span>`
  }
  connect($el, null, setFocus)
  return $el
}

function cell (state, cellData, cellConfig, rowNumber, colNumber, chooRoot, send) {
  const activeCell = state.activeCell
  const isActive = activeCell.row === rowNumber && activeCell.col === colNumber
  const inEdit = isActive && state.inEdit === true
  const cellValue = inEdit ? state.scratch : cellData

  const $el = v`
    <span tabindex="0" class="${grid} cell">
        ${getEditor(cellValue, cellConfig, isActive, inEdit, rowNumber, colNumber, chooRoot, send)}
    </span>`

  return $el
}

module.exports = cell
