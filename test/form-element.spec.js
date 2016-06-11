const test = require('tape')
const formElement = require('../lib/form-element')

test('makes an input', (t) => {
  const i = formElement()
  t.equal(i.tagName, 'INPUT', 'input')
  t.equal(i.type, 'text', 'is text')
  t.end()
})

test('sets params and actions', (t) => {
  t.plan(4)
  const i = formElement('text', {value: 'this', autofocus: true, class: 'test'}, {onkeydown: (evt) => t.ok(true, 'fired')})
  t.equal(i.value, 'this', 'value')
  t.ok(i.getAttribute('autofocus'), 'autofocus')
  t.equal(i.getAttribute('class'), 'test', 'has classes')
  i.onkeydown()
})

test('select boxes', (t) => {
  const s = formElement('select', {value: 'yo'}, null, [{value: 'yo', name: 'hi'}, {value: 'foo'}])
  t.equal(s.tagName, 'SELECT', 'is select')
  t.equal(s.childElementCount, 2, 'has two options')
  for (let i = 0, len = s.childElementCount; i < len; i++) {
    t.equal(s.children[i].tagName, 'OPTION', 'is option')
    if (s.children[i].value === 'yo') {
      t.ok(s.children[i].getAttribute('selected'), 'is selected')
    }
  }
  t.end()
})
