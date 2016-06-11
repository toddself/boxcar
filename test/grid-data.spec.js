const test = require('tape')
const choo = require('choo')
const gridData = require('../grid-data')
const createKeyEvent = require('./create-key-event')
const gridKeydown = require('../lib/grid-keydown')

const defaultHeaders = [
  {id: '1', name: 'col1'},
  {id: '2', name: 'col2'}
]

const defaultData = [
  {1: 'hi', 2: 'test'},
  {1: 'yo', 2: 'word'}
]

test('root must be string', (t) => {
  t.throws(() => gridData([]))
  t.end()
})

test('data must be array', (t) => {
  t.throws(() => gridData('c', [], 'not an array'))
  t.end()
})

test('headers must be array', (t) => {
  t.throws(() => gridData('c', 'lol nope', []))
  t.end()
})

test('choo does not complain', (t) => {
  const app = choo()
  t.doesNotThrow(() => app.model(gridData('c', [{id: 'hi', name: 'yo'}], [])))
  t.end()
})

test('has all the moves', (t) => {
  let tree
  let loop = 0
  const triggers = [
    () => {},
    () => tree.dispatchEvent(createKeyEvent('keydown', 'ArrowRight')),
    () => tree.dispatchEvent(createKeyEvent('keydown', 'ArrowLeft')),
    () => tree.dispatchEvent(createKeyEvent('keydown', 'Tab')),
    () => tree.dispatchEvent(createKeyEvent('keydown', 'ArrowDown')),
    () => tree.dispatchEvent(createKeyEvent('keydown', 'ArrowUp')),
    () => tree.dispatchEvent(createKeyEvent('keydown', 'Tab', {shift: true})),
    () => tree.dispatchEvent(createKeyEvent('keydown', 'Enter')),
    () => {},
    () => tree.dispatchEvent(createKeyEvent('input', 'yo')),
    () => {},
    () => tree.dispatchEvent(createKeyEvent('keydown', 'Escape')),
    () => {}
  ]

  const tests = [
    (state) => t.deepEqual(state.c.activeCell, {row: 0, col: 0}, '0, 0 initial'), // 0 initial
    (state) => t.deepEqual(state.c.activeCell, {row: 0, col: 1}, '0, 1 right'), // 1 right
    (state) => t.deepEqual(state.c.activeCell, {row: 0, col: 0}, '0, 0 left'), // 2 left
    (state) => t.deepEqual(state.c.activeCell, {row: 0, col: 1}, '0, 1 tab (right)'), // 3 tab
    (state) => t.deepEqual(state.c.activeCell, {row: 1, col: 1}, '1, 1 down'), // 4 down
    (state) => t.deepEqual(state.c.activeCell, {row: 0, col: 1}, '0, 1 up'), // 5 up
    (state) => t.deepEqual(state.c.activeCell, {row: 0, col: 0}, '0, 0 shift tab (right)'), // 6 shifttab
    (state) => t.ok(state.c.inEdit, 'edit mode actived'), // 7 enter
    (state) => t.equal(state.c.scratch, 'hi', 'scratch is set'), // 8 enter sends two actions...
    (state) => t.equal(state.c.scratch, 'hiyo', `scratch is now ${state.c.scratch}`),
    (state) => t.equal(state.c.scratch, 'hiyo', `scratch is now ${state.c.scratch}`),
    (state) => t.ok(!state.c.inEdit, 'edit mode deactivated'),
    (state) => t.equal(state.c.scratch, '', 'scratch cleared')
  ]
  t.plan(tests.length)

  const app = choo()
  app.model(gridData('c', defaultHeaders, defaultData))

  const main = (params, state, send) => {
    tests[loop] && tests[loop](state)
    setTimeout(() => triggers[loop] && triggers[loop](), 5)
    ++loop
    return choo.view`<input
      onkeydown=${(evt) => gridKeydown(evt, state.c.inEdit, 'c', send)}
      oninput=${(evt) => state.c.inEdit && send('c:updateScratch', {value: `${evt.target.value}${evt.key || evt.keyIdentifier}`})}
      value=${state.c.scratch}
    >`
  }
  app.router((route) => [route('/', main)])

  tree = app.start()
  document.body.appendChild(tree)
})
