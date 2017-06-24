const html = require('bel')

const Cell = require('./cell')

module.exports = Row

function Row (columns, data) {
  if (!(this instanceof Row)) return new Row(columns)

  this.columns = columns
  this._order = Object.keys(this.columns)
  this.cells = []

  if (this._order.length > 0) {
    this.setColumns()
  }
}

Row.prototype.setColumns = function setColumns (columns) {
  for (let i = 0, len = this._order.length; i < len; i++) {
    const key = this._order[i]
    const column = this.columns[key]
    this.addColumn(key, column)
  }
}

Row.prototype.addColumn = function addColumn (id, opts) {
  this.columns[id] = new Cell(id, opts)
  this._order.push(id)
}

Row.prototype.render = function render () {
  return html`<tr>
    ${this.cells.map((cell) => cell.render())}
  </tr>`
}
