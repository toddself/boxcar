'use strict'

const html = require('choo/html')

const grid = require('./styles.js')
const formElement = require('./lib/form-element')

function getEditor (cellData, cellConfig, isActive, inEdit, row, col, chooRoot, send) {
  const params = {
    class: `${grid} ${isActive ? 'active' : ''} cell-content cell-editor`,
    autofocus: true,
    value: cellData
  }

  const oninput = (evt) => send(`${chooRoot}:updateScratch`, {value: evt.target.value})
  const onchange = (evt) => {
    const val = evt.target.type === 'checkbox' ? evt.target.checked : evt.target.value
    send(`${chooRoot}:commit`, {value: val})
  }

  const actions = {}
  if (cellConfig.editorType === 'select' || cellConfig.editorType === 'checkbox') {
    actions.onchange = onchange
  } else {
    actions.oninput = oninput
  }

  return formElement(cellConfig.editorType, params, actions, cellConfig.options)
}

function getCellDisplay (cellData, cellConfig, isActive, inEdit, row, col, chooRoot, send) {
  if (cellConfig.editorType === 'select') {
    const opt = cellConfig.options.find(d => d.value === cellData)
    cellData = opt && opt.name || cellData
  } else if (cellConfig.editorType === 'checkbox') {
    if (cellData) {
      cellData = '☑️'
    } else {
      cellData = ''
    }
  }

  return html`<span
    onclick=${() => send(`${chooRoot}:move`, {mouse: true, row: row, col: col, key: ''})}
    class="${grid} ${isActive ? 'active' : ''} cell-content cell-data">
      ${cellData}
    </span>`
}

function cellContent (cellData, cellConfig, isActive, inEdit, row, col, chooRoot, send) {
  let $el
  if (inEdit) {
    $el = getEditor(cellData, cellConfig, isActive, inEdit, row, col, chooRoot, send)
  } else {
    $el = getCellDisplay(cellData, cellConfig, isActive, inEdit, row, col, chooRoot, send)
  }
  return $el
}

function cell (state, cellValue, cellConfig, row, col, chooRoot, send) {
  const activeCell = state.activeCell
  const isActive = activeCell.row === row && activeCell.col === col
  const inEdit = isActive && state.inEdit === true
  const cellData = inEdit ? state.scratch : cellValue

  const $el = html`
    <span tabindex="0" class="${grid} cell">
        ${cellContent(cellData, cellConfig, isActive, inEdit, row, col, chooRoot, send)}
    </span>`

  return $el
}

module.exports = cell
