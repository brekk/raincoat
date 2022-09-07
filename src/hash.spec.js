import { of as makeMap } from 'cartographic'

// import ripjam from 'ripjam/test'
import {
  upsertDocs,
  cleanBlocks,
  makeBlockArray,
  cleanString,
  hashString,
} from './hash'

test('hashString', () => {
  expect(hashString('cool dope science')).toEqual(
    '4ffcaac60dc85ef069c49a96bda3fcea'
  )
})

test('cleanString', () => {
  expect(
    cleanString(`
                                  
                     sdkjfslkdfj
      sldjf
    232
        
    nice`)
  ).toEqual('sdkjfslkdfjsldjf232nice')
})

test('makeBlockArray', () => {
  expect(
    makeBlockArray(`
oh
nice

how

cool

is

that

?`)
  ).toEqual([
    `
oh
nice`,
    `how`,
    `cool`,
    `is`,
    `that`,
    `?`,
  ])
})

test('cleanBlocks', () => {
  expect(
    cleanBlocks([
      `a
b`,
      ``,
      '',
      `c\td`,
      `e\n\n\n\n\n\n\nf`,
    ])
  ).toEqual([`ab`, `cd`, `ef`])
})

test('upsertDocs', () => {
  const docs = makeMap([
    ['a', 1],
    ['b', 2],
    ['c', 3],
    ['d', 4],
    ['e', 5],
  ])
  expect(upsertDocs(2, docs)).toBeTruthy()
})
