'use strict'
const assert = require('assert')
const shortid = require('shortid')

const bus = require('./lib/bus')
const getActiveCellContents = require('./lib/get-active-cell-contents.js')

const move = require('./effects/move.js')

const validators = {}
const identity = (x) => x

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
    const f = h.validator || identity
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
        send(`${chooRoot}:unsetEdit`)
        send(`${chooRoot}:updateData`, {value: action.value || state.scratch})
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
        const row = state.data.findIndex(r => r.id === action.id)
        send(`${chooRoot}:insertRow`, {row: row})
      }
    },
    reducers: {
      setActive: (action, state) => {
        console.log(`Setting active to ${action.row}, ${action.col}`)
        const cell = {row: action.row, col: action.col}
        bus.emit('activeCell', cell)
        return {activeCell: cell}
      },
      setEdit: (action, state) => {
        return {inEdit: true}
      },
      unsetEdit: (action, state) => {
        return {inEdit: false}
      },
      updateScratch: (action, state) => {
        return {scratch: action.value}
      },
      updateData: (action, state) => {
        const row = state.activeCell.row
        const colId = state.header[state.activeCell.col].id
        const rowId = state.data[row].id
        const validator = validators[colId]
        let value
        try {
          value = validator(value)
        } catch (err) {
          return {error: err}
        }
        const data = state.data.slice(0)
        bus.emit('update', {rowId: rowId, colId: colId, value: value})
        data[row][colId] = value
        return {data: data}
      },
      clearScratch: (action, state) => {
        return {scratch: ''}
      },
      insertRow: (action, state) => {
        const row = {id: shortid.generate()}
        state.headers.forEach(h => {
          row[h.id] = h.default || ''
        })
        const data = state.data.slice(0)
        data.splice(action.beforeId, 0, data)
        bus.emit('insertRow', {before: action.beforeId, rows: [data]})
        return {data: data}
      },
      removeRow: (action, state) => {
        if (action.row >= state.data.length) {
          action.row = 0
        }
        const data = state.data.slice(0)
        data.splice(action.row, 1)
        bus.emit('removeRow', {row: action.row})
        return {data: data}
      },
      userActive: (action, state) => {
        const users = {}
        users[state.user] = {row: state.row, col: state.col}
        return users
      }
    },
    subscriptions: [
      (send) => bus.on('removeRow', (evt) => send(`${chooRoot}:removeById`, {id: evt.id})),
      (send) => bus.on('insertRow', (evt) => send(`${chooRoot}:insertById`, {id: evt.id})),
      (send) => bus.on('userActive', (evt) => send(`${chooRoot}:userActive`, {user: evt.user, row: evt.row, col: evt.col}))
    ]
  }
}
