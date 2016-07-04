'use strict'
const assert = require('assert')
const shortid = require('shortid')
const pull = require('pull-stream')

const outbound = require('./lib/notify').outbound
const inbound = require('./lib/notify').inbound
const getActiveCellContents = require('./lib/get-active-cell-contents.js')
const move = require('./effects/move.js')

const validators = {}
const disallowedTypes = ['hidden', 'file', 'radio', 'reset', 'submit']

// default validators
const identity = (x) => x
const member = (group, x) => {
  if (group.indexOf(x) > -1) {
    return x
  }
  throw new Error(`${x} is not a member of ${group.join(', ')}`)
}

module.exports = function (chooRoot, header, data) {
  assert.ok(typeof chooRoot === 'string', `${chooRoot} must be a string`)
  data = data || []
  header = header || []

  if (!Array.isArray(data)) {
    throw new Error(`data must be an array, was ${typeof data}`)
  }

  if (!Array.isArray(header)) {
    throw new Error(`headers must be an array, was ${typeof data}`)
  }

  header = header.map(h => {
    h.editorType = h.editorType || 'text'
    if (disallowedTypes.indexOf(h.editorType) > -1) {
      throw new Error(`${h.editorType} is not an allowed type of form element`)
    }

    let defaultValidator = identity
    if (h.editorType === 'select') {
      defaultValidator = member.bind(null, h.options.map(o => o.value))
    }
    const f = h.validator || defaultValidator
    assert.ok(typeof f === 'function', 'validators must be functions')
    validators[h.id] = f
    h.validator = void 0
    return h
  })

  return {
    namespace: chooRoot,
    state: {
      header: header,
      data: data,
      activeCell: {row: 0, col: 0},
      inEdit: false,
      scratch: '',
      error: null,
      users: {}
    },
    effects: {
      move: move(chooRoot),
      edit: (action, state, send) => {
        send(`${chooRoot}:setEdit`)
        const initialValue = action.value || getActiveCellContents(state)
        send(`${chooRoot}:updateScratch`, {value: initialValue})
      },
      commit: (action, state, send) => {
        outbound({type: 'commit', action})
        let val = state.scratch
        if (typeof action.value !== 'undefined') {
          val = action.value
        }
        console.log(`action was ${typeof action.value}, scratch was ${state.scratch} val is ${val}`)
        send(`${chooRoot}:unsetEdit`)
        send(`${chooRoot}:updateData`, {value: val})
        send(`${chooRoot}:clearScratch`)
      },
      revert: (action, state, send) => {
        send(`${chooRoot}:unsetEdit`)
        send(`${chooRoot}:clearScratch`)
      },
      removeById: (action, state, send) => {
        const row = state.data.findIndex(r => r.id === action.id)
        send(`${chooRoot}:removeRow`, {row: row})
      },
      insertById: (action, state, send) => {
        let insertRow = action.id
        if (action.id === 'top') {
          insertRow = 0
        } else if (action.id === 'bottom') {
          insertRow = state.data.length
        } else {
          insertRow = state.data.findIndex(r => r.id === action.id)
        }

        send(`${chooRoot}:insertRow`, {row: insertRow})
      }
    },
    reducers: {
      setActive: (action, state) => {
        const cell = {row: action.row, col: action.col}
        outbound({type: 'activeCell', data: cell})
        return {activeCell: cell}
      },
      setEdit: (action, state) => {
        return {inEdit: true}
      },
      unsetEdit: (action, state) => {
        return {inEdit: false}
      },
      updateScratch: (action, state) => {
        outbound({type: 'updateScratch', data: action.value})
        return {scratch: action.value}
      },
      updateData: (action, state) => {
        const row = state.activeCell.row
        const colId = state.header[state.activeCell.col].id
        const rowId = state.data[row].id
        const validator = validators[colId]
        let value
        try {
          value = validator(action.value)
        } catch (err) {
          return {error: err}
        }
        const data = state.data.slice(0)
        outbound({type: 'update', data: {rowId: rowId, colId: colId, value: value}})
        data[row][colId] = value
        return {data: data}
      },
      clearScratch: (action, state) => {
        return {scratch: ''}
      },
      insertRow: (action, state) => {
        let rows = action.rows
        if (!Array.isArray(rows)) {
          rows = [{id: shortid.generate()}]
        }
        rows.forEach(r => {
          state.header.forEach(h => {
            r[h.id] = h.default || ''
          })
        })
        const data = state.data.slice(0)
        data.splice(action.row, 0, rows)
        outbound({type: 'insertRow', data: {before: action.row, rows: rows}})
        return {data: data}
      },
      removeRow: (action, state) => {
        if (action.row >= state.data.length) {
          action.row = 0
        }
        const data = state.data.slice(0)
        data.splice(action.row, 1)
        outbound({type: 'removeRow', data: {row: action.row}})
        return {data: data}
      },
      userActive: (action, state) => {
        const users = {}
        users[action.user] = {row: action.row, col: action.col}
        return users
      }
    },
    subscriptions: [
      (send) => {
        pull(inbound.listen(), pull.drain((evt) => {
          switch (evt.type) {
            case 'removeRow':
              send(`${chooRoot}:removeById`, {id: evt.id})
              break
            case 'insertRow':
              send(`${chooRoot}:insertById`, {id: evt.id, rows: evt.rows})
              break
            case 'updateCell':
              send(`${chooRoot}:updateCell`, {cell: evt.cell, data: evt.data})
              break
            case 'userActive':
              send(`${chooRoot}:userActive`, {user: evt.user, row: evt.row, col: evt.col})
              break
          }
        }))
      }
    ]
  }
}
