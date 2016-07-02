const v = require('choo').view

const cell = require('./cell')
const grid = require('./styles')

function row (state, rowData, rowNumber, bid, send) {
  const columnOrder = state.header.map(c => c.id)

  return v`<span class="row ${grid}">
    ${columnOrder.map((column, idx) => cell(state, rowData[column], state.header[idx], rowNumber, idx, bid, send))
  }</span>`
}

module.exports = row
