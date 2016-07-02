'use strict'
const assert = require('assert')
const shortid = require('shortid')

const notify = require('./lib/notify')
const getActiveCellContents = require('./lib/get-active-cell-contents.js')
const move = require('./effects/move.js')

const validators = {}
const disallowedTypes = ['hidden', 'file', 'radio', 'reset', 'submit']
const bus = {
  on: () => {}
}

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
        notify({type: 'commit', action})
        let val = state.scratch
        if (typeof action.value !== 'undefined') {
          val = action.value
        }
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
        notify({type: 'activeCell', data: cell})
        return {activeCell: cell}
      },
      setEdit: (action, state) => {
        return {inEdit: true}
      },
      unsetEdit: (action, state) => {
        return {inEdit: false}
      },
      updateScratch: (action, state) => {
        notify({type: 'updateScratch', data: action.value})
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
        notify({type: 'update', data: {rowId: rowId, colId: colId, value: value}})
        data[row][colId] = value
        return {data: data}
      },
      clearScratch: (action, state) => {
        return {scratch: ''}
      },
      insertRow: (action, state) => {
        const row = {id: shortid.generate()}
        state.header.forEach(h => {
          row[h.id] = h.default || ''
        })
        const data = state.data.slice(0)
        data.splice(action.beforeId, 0, data)
        notify({type: 'insertRow', data: {before: action.beforeId, rows: [data]}})
        return {data: data}
      },
      removeRow: (action, state) => {
        if (action.row >= state.data.length) {
          action.row = 0
        }
        const data = state.data.slice(0)
        data.splice(action.row, 1)
        notify({type: 'removeRow', data: {row: action.row}})
        return {data: data}
      },
      userActive: (action, state) => {
        const users = {}
        users[state.user] = {row: state.row, col: state.col}
        return users
      }
    },
    subscriptions: [
      (send) => bus.on('deleteRow', (evt) => send(`${chooRoot}:removeById`, {id: evt.id})),
      (send) => bus.on('addRow', (evt) => {
        send(`${chooRoot}:insertById`, {id: evt.id})
      }),
      (send) => bus.on('userActive', (evt) => send(`${chooRoot}:userActive`, {user: evt.user, row: evt.row, col: evt.col}))
    ]
  }
}
