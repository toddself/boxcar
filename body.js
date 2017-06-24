const assert = require('assert')
const html = require('bel')

const Row = require('./row')

module.exports = Body

function Body (columns, data) {
  if (!(this instanceof Body)) return new Body(columns, data)
  assert.ok(typeof columns === 'object', 'columns must be an object')

  this.rows = []
  this.columns = columns
  this.setData(data)
}

Body.prototype.setData = function setData (data) {
  assert.ok(Array.isArray(data), 'data must be an array')
  this.data = data
  this._createRows()
}

Body.prototype._createRows = function createRows () {
  this.data.forEach((row) => {
    this.rows.push(new Row(this.columns, row))
  })
}

Body.prototype.setColumns = function setColumns (columns) {
  this.rows.forEach((row) => row.setColumns(columns))
}

Body.prototype.render = function render () {
  return html`<tbody>
    ${this.rows.map((row) => row.render())}
  </tbody>`
}
