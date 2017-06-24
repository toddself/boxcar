const html = require('bel')

module.exports = Cell

function Cell (data, opts) {
  if (!(this instanceof Cell)) return new Cell(data, opts)
  this.data = data
  this.opts = opts || {}
}

Cell.prototype.render = function render () {
  return html`<td>${this.data}</td>`
}
