const test = require('tape')
const choo = require('choo')
const html = require('choo/html')
const gridData = require('../grid-data')
const createKeyEvent = require('./create-key-event')
const gridKeydown = require('../lib/grid-keydown')

const defaultHeaders = [
  {id: 'c1', name: 'col1'},
  {id: 'c2', name: 'col2'}
]

const defaultData = [
  {c1: 'hi', c2: 'test'},
  {c1: 'yo', c2: 'word'}
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

test('no forbidden types', (t) => {
  t.throws(() => gridData('c', [{id: 'hi', editorType: 'hidden'}], []))
  t.throws(() => gridData('c', [{id: 'hi', editorType: 'file'}], []))
  t.throws(() => gridData('c', [{id: 'hi', editorType: 'radio'}], []))
  t.throws(() => gridData('c', [{id: 'hi', editorType: 'reset'}], []))
  t.throws(() => gridData('c', [{id: 'hi', editorType: 'submit'}], []))
  t.end()
})

test('choo does not complain', (t) => {
  const app = choo()
  t.doesNotThrow(() => app.model(gridData('c', [{id: 'hi', name: 'yo'}], [])))
  t.end()
})

test('arrow keys and enter/escape from edit', (t) => {
  let tree
  let loop = 0
  const triggers = [
    () => {},
    () => tree.dispatchEvent(createKeyEvent('keydown', 'ArrowRight')),
    () => tree.dispatchEvent(createKeyEvent('keydown', 'ArrowRight')),
    () => tree.dispatchEvent(createKeyEvent('keydown', 'ArrowLeft')),
    () => tree.dispatchEvent(createKeyEvent('keydown', 'Tab')),
    () => tree.dispatchEvent(createKeyEvent('keydown', 'ArrowDown')),
    () => tree.dispatchEvent(createKeyEvent('keydown', 'ArrowDown')),
    () => tree.dispatchEvent(createKeyEvent('keydown', 'ArrowUp')),
    () => tree.dispatchEvent(createKeyEvent('keydown', 'Tab', {shift: true})),
    () => tree.dispatchEvent(createKeyEvent('keydown', 'ArrowLeft')),
    () => tree.dispatchEvent(createKeyEvent('keydown', 'ArrowUp')),
    () => tree.dispatchEvent(createKeyEvent('keydown', 'Enter')),
    () => tree.dispatchEvent(createKeyEvent('input', 'yo')),
    () => tree.dispatchEvent(createKeyEvent('keydown', 'Escape'))
  ]

  const tests = [
    (state) => t.deepEqual(state.c.activeCell, {row: 0, col: 0}, '0, 0 initial'), // 0 initial
    (state) => t.deepEqual(state.c.activeCell, {row: 0, col: 1}, '0, 1 right'), // 1 right
    (state) => t.deepEqual(state.c.activeCell, {row: 0, col: 1}, '0, 1 does not go negative right'), // 2 right
    (state) => t.deepEqual(state.c.activeCell, {row: 0, col: 0}, '0, 0 left'), // 2 left
    (state) => t.deepEqual(state.c.activeCell, {row: 0, col: 1}, '0, 1 tab (right)'), // 3 tab
    (state) => t.deepEqual(state.c.activeCell, {row: 1, col: 1}, '1, 1 down'), // 4 down
    (state) => t.deepEqual(state.c.activeCell, {row: 1, col: 1}, '1, 1 does not go negative down'), // 4 down
    (state) => t.deepEqual(state.c.activeCell, {row: 0, col: 1}, '0, 1 up'), // 5 up
    (state) => t.deepEqual(state.c.activeCell, {row: 0, col: 0}, '0, 0 shift tab (right)'), // 6 shifttab
    (state) => t.deepEqual(state.c.activeCell, {row: 0, col: 0}, '0, 0 does not go negative left'), // 7 left
    (state) => t.deepEqual(state.c.activeCell, {row: 0, col: 0}, '0, 0 does not go negative up'), // 8 up
    (state) => t.ok(state.c.inEdit, 'edit mode actived'), // 7 enter
    (state) => t.equal(state.c.scratch, 'hiyo', `scratch is now ${state.c.scratch}`),
    (state) => t.ok(!state.c.inEdit, 'edit mode deactivated')
  ]
  t.plan(tests.length)

  const app = choo()
  app.model(gridData('c', defaultHeaders, defaultData))

  const main = (state, prev, send) => {
    tests[loop] && tests[loop](state)
    setTimeout(() => triggers[loop] && triggers[loop](), 5)
    ++loop
    return html`<input
      onkeydown=${(evt) => gridKeydown(evt, state.c.inEdit, 'c', send)}
      oninput=${(evt) => state.c.inEdit && send('c:updateScratch', {value: `${evt.target.value}${evt.key || evt.keyIdentifier}`})}
      value=${state.c.scratch}
    >`
  }
  app.router((route) => [route('/', main)])

  tree = app.start({name: 'c'})
  document.body.appendChild(tree)
})

test('committing edit', (t) => {
  const app = choo()
  app.model(gridData('d', defaultHeaders, defaultData))
  let tree
  let loop = 0

  const triggers = [
    () => {},
    () => tree.dispatchEvent(createKeyEvent('keydown', 'Enter')),
    () => tree.dispatchEvent(createKeyEvent('input', 'hello, world')),
    () => tree.dispatchEvent(createKeyEvent('keydown', 'Enter'))
  ]
  const tests = [
    (state) => t.equal(state.d.data[0].c1, 'hi', 'no value initally'),
    (state) => t.ok(state.d.inEdit, 'set edit mode'),
    (state) => t.equal(state.d.scratch, 'hello, world', 'hello, world in scratch'),
    (state) => t.ok(!state.d.inEdit, 'removed edit mode')
  ]

  t.plan(tests.length)

  const main = (state, prev, send) => {
    tests[loop] && tests[loop](state)
    setTimeout(() => triggers[loop] && triggers[loop](), 5)
    ++loop
    return html`<input
      type="text"
      onkeydown=${(evt) => gridKeydown(evt, state.d.inEdit, 'd', send)}
      oninput=${updateScratch}
      value=${state.d.scratch}>`
    function updateScratch (evt) {
      if (state.d.inEdit) {
        send('d:updateScratch', {value: evt.key || evt.keyIdentifier})
      }
    }
  }
  app.router((route) => [route('/', main)])
  tree = app.start({name: 'd'})
  document.body.appendChild(tree)
})

test('commit edit via mouse click', {disabled: true}, (t) => {
  t.end()
})

test('activate via double click', {disabled: true}, (t) => {
  t.end()
})

test('commit edit via tab key', {disabled: true}, (t) => {
  t.end()
})

test('custom and default validators', {disabled: true}, (t) => {
  t.end()
})

test('insert and remove row from internal & external', {disabled: true}, (t) => {
  t.end()
})

test('update active user', {disabled: true}, (t) => {
  t.end()
})

test('update cell from external', {disabled: true}, (t) => {
  t.end()
})
