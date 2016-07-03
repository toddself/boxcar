const v = require('choo').view

const grid = require('./styles')

function headerRow (headerConfig) {
  return v`<div class="row ${grid} header">
    ${headerConfig.map(column => v`<span class="${grid} cell">${column.name}</span>`)}
  </tr>`
}

module.exports = headerRow
