const assert = require('assert')

const html = require('bel')
const Nanobus = require('nanobus')

const Row = require('./row')
const Body = require('./body')

module.exports = Boxcar

function Boxcar (opts) {
  if (!(this instanceof Boxcar)) return new Boxcar(opts)
  Nanobus.call(this)
  assert.ok(typeof opts.columns === 'object', 'opts.columns must be an object')
  assert.ok(opts.data && Array.isArray(opts.data), 'opts.data must be an array')

  this.columns = opts.columns
  this.data = opts.data || []
}

Boxcar.prototype = Object.create(Nanobus.prototype)

Boxcar.prototype._createHeader = function _createHeader () {
  this._header = new Row(this.columns)
}

Boxcar.prototype._createBody = function _createBody () {
  this._body = new Body(this.columns, this.data)
}

Boxcar.prototype.render = function render () {
  return html`<table>
    <thead>
      ${this._header.render()}
    </thead>
    ${this._body.render()}
  </table>`
}
