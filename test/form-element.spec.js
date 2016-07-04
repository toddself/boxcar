const test = require('tape')
const formElement = require('../lib/form-element')

test('makes an input', (t) => {
  const i = formElement()
  t.equal(i.tagName, 'INPUT', 'input')
  t.equal(i.type, 'text', 'is text')
  t.end()
})

test('sets params and actions', (t) => {
  t.plan(3)
  const i = formElement('text', {value: 'hey', autofocus: true, class: 'test'})
  t.equal(i.value, 'hey', 'value')
  t.ok(i.getAttribute('autofocus'), 'autofocus')
  t.equal(i.getAttribute('class'), 'test', 'has classes')
  // for some reason when you call i.focus(), focus isn't received untilo
  // after the test is run so this will always fail:
  // i.focus()
  // t.equal(i.selectionStart, 3, 'at end of text')
})

test('select boxes', (t) => {
  'use strict'
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

test('checkboxes', (t) => {
  const c = formElement('checkbox', {value: true}, null, null)
  t.equal(c.tagName, 'INPUT', 'is input')
  t.equal(c.type, 'checkbox', 'is checkbox')
  t.ok(c.checked, 'checked')
  t.end()
})

test('default', (t) => {
  const c = formElement('email', {value: true}, null, null)
  t.equal(c.tagName, 'INPUT', 'is input')
  t.equal(c.type, 'email', 'is email')
  t.end()
})
