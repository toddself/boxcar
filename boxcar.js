const assert = require('assert')
const choo = require('choo')
const shortid = require('shortid')
const connect = require('@toddself/throw-down/connect')
const v = choo.view

const grid = require('./styles')
const cell = require('./cell')
const gridData = require('./grid-data')
const bus = require('./lib/bus')
const gridKeyDown = require('./lib/grid-keydown')

const app = choo()

function headerRow (headerConfig) {
  return v`<div class="row ${grid}">
    ${headerConfig.map(column => choo.view`<span class="${grid} cell">${column.name}</span>`)}
  </tr>`
}

function row (state, rowData, rowNumber, bid, send) {
  const columnOrder = state.header.map(c => c.id)

  return v`<span class="row ${grid}">
    ${columnOrder.map((column, idx) => cell(state, rowData[column], state.header[idx], rowNumber, idx, bid, send))
  }</span>`
}

function boxcar (anchorNode, opts) {
  opts = opts || {}
  assert.ok(opts.hasOwnProperty('columns'), 'You must supply a column config')
  const bid = opts.root || `boxcar-${shortid.generate()}`
  const model = gridData(bid, opts.columns, opts.data || [])

  app.model(model)
  app.router((route) => [
    route('/', boxcarMain)
  ])

  const tree = app.start({name: bid})
  anchorNode.appendChild(tree)
  return bus

  function boxcarMain (params, state, send) {
    const $main = v`
      <div
        tabindex="0"
        class="${grid}"
        onkeydown=${(evt) => gridKeyDown(evt, state.inEdit, bid, send)}>
        <div class="${grid} .grid">
          <header>
           ${headerRow(state[bid].header)}
          </header>
          <div class="${grid} .scroller">
           ${state[bid].data.map((rowData, rowNumber) => row(state[bid], rowData, rowNumber, bid, send))}
          </div>
       </div>
      </div>`
    connect($main, null, (node) => node.focus())
    return $main
  }
}

module.exports = boxcar
