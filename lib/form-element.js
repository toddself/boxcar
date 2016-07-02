'use strict'

const choo = require('choo')
const v = choo.view

function select (params, actions, options) {
  return v`<select ${params} ${actions}>
      ${options.map(o => {
        const selected = {}
        if (o.value === params.value) {
          selected.selected = true
        }
        return v`<option value="${o.value}" ${selected}>${o.name || o.value}</option>`
      })}
    </select>`
}

function basic (params, actions, options, type) {
  return v`<input type="${type}" ${params} ${actions}>`
}

function checkbox (params, actions, options) {
  if (params.value) {
    params.checked = true
  }

  return basic(params, actions, options, 'checkbox')
}

const elements = {
  select: select,
  text: (p, a, o) => basic(p, a, o, 'text'),
  email: (p, a, o) => basic(p, a, o, 'email'),
  checkbox: checkbox,
  default: (p, a, o, t) => basic(p, a, o, t)
}

module.exports = function formElement (type, params, actions, options) {
  params = params || {}
  actions = actions || {}
  options = options || []
  type = type || 'text'
  const elFn = elements[type] || elements.default
  if (type !== 'checkbox' && type !== 'select') {
    delete actions.onchange
  }

  return elFn(params, actions, options, type)
}
