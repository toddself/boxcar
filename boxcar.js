const assert = require('assert')
const choo = require('choo')
const shortid = require('shortid')
const connect = require('@toddself/throw-down/connect')
const v = choo.view

const api = require('./api')
const grid = require('./styles')
const headerRow = require('./headers')
const row = require('./row')
const gridData = require('./grid-data')
const gridKeyDown = require('./lib/grid-keydown')

function boxcar (anchorNode, opts) {
  const app = choo()
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
  return api

  function boxcarMain (params, state, send) {
    const $main = v`
      <div
        tabindex="0"
        class="${grid}"
        onkeydown=${(evt) => gridKeyDown(evt, state[bid].inEdit, bid, send)}>
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
