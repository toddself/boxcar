'use strict'

const choo = require('choo')
const v = choo.view

module.exports = function formElement (type, params, actions, options) {
  params = params || {}
  actions = actions || {}
  options = options || []
  let $el

  if (type === 'select') {
    $el = v`<select ${params} ${actions}>
      ${options.map(o => {
        let selected = ''
        if (o.value === params.value) {
          selected = ' selected="true" '
        }
        return v`<option value=${o.value}${selected}>${o.name || o.value}</option>`
      })}
    </select>`
  } else {
    $el = v`<input type="${type || 'text'}" ${params} ${actions}>`
  }
  return $el
}
