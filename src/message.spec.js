import { includes, keys } from 'ramda'

import { box, makeMessage, summarize } from './message'

const docs = [
  '/a/b/c/dope/hey.nice',
  '/sleepy/creepy/clown.face',
  '/oh/yeah/mr.koolaid',
]
test('summarize', () => {
  expect(summarize(docs)).toEqual(`${docs[0]}, ${docs[1]} and ${docs[2]}`)
  expect(summarize(docs.slice(0, 2))).toEqual(`${docs[0]} and ${docs[1]}`)
})

test('makeMessage', () => {
  const type = 'shit'
  const hashes = ['a', 'b', 'c']
  const content = 'yooyoooyyooo'
  const message = makeMessage(docs, type, hashes, content)
  expect(keys(message).sort()).toEqual(['addDoc', 'hasDoc', 'summarize'])
  const squippy = 'squippy dippy nippy bip'
  expect(includes(docs[0], docs)).toBeTruthy()
  expect(message.hasDoc(docs[0])).toBeTruthy()
  expect(message.hasDoc(squippy)).toBeFalsy()
  message.addDoc(squippy)
  expect(message.hasDoc(squippy)).toBeTruthy()
})

test('box', () => {
  expect(box('abc'.split(''))).toEqual('abc'.split(''))
  expect(box(12).toEqual([12]))
})
