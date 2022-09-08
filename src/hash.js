import crypto from 'node:crypto'

import {
  __ as $,
  addIndex,
  adjust,
  concat,
  curry,
  curryN,
  forEach,
  identity as I,
  ifElse,
  includes,
  insert,
  isEmpty,
  lensIndex,
  lensProp,
  map,
  mergeRight,
  nth,
  objOf,
  of,
  pipe,
  propOr,
  reduce,
  reject,
  replace,
  set,
  split,
  tap,
  unless,
  when,
} from 'ramda'
import {
  get as mapGet,
  set as mapSet,
  of as makeMap,
  has as mapHas,
} from 'cartographic'

import { makeMessage } from './message'
import { info as __info, debug as __debug } from './trace'
import { IDENTICAL_FILE, INTER_FILE_DUPLICATE } from './constants'

export const hashString = s => crypto.createHash('md5').update(s).digest('hex')
export const cleanString = replace(/(\n|\s|\t)/g, '')
export const cleanHash = pipe(
  // clean up the string
  cleanString,
  // hash it
  hashString
)
export const makeBlockArray = pipe(split('\n\n'), reject(isEmpty))
export const cleanBlocks = pipe(reject(isEmpty), map(cleanString))

// export const generateComparisons = () => {}

// update `messages` in docs
const upsertDocs = curryN(2, (index, docs) =>
  pipe(
    // get a specific index
    nth(index),
    // at that index, get the filePath if possible
    propOr('???', 'filePath'),
    // if !msg.docs.includes(docs[i].filePath)
    unless(includes($, docs), pipe(of, concat(docs))),
    // push the update back into the docs
    adjust(index, I, docs)
  )(docs)
)

const upsertMessages = curryN(3, (messages, index) =>
  pipe(
    // get a specific message
    nth($, messages),
    // find its docs
    propOr([], 'docs'),
    upsertDocs(index)
  )(index)
)

export const generateComparisons = pipe(
  addIndex(reduce)(
    ({ messages, fullDocHashes, allBlockHashes }, [doc, content], docInd) =>
      pipe(
        cleanHash,
        ifElse(
          // if it's already in the fullDocHashes
          mapHas($, fullDocHashes),
          // update the index
          set($, { docInd }, fullDocHashes),
          // otherwise
          __debug('otherwise')
          // pipe(
          //   // get the
          //   get($),
          //   // message index of the docHash
          //   propOr(-1, 'msgInd'),
          //   ifElse(
          //     // some matches
          //     lt(-1),
          //     upsertMessages(messages),
          //     pipe()
          //   )
          // )
        )
      )(content),
    {
      messages: [],
      fullDocHashes: makeMap(),
      allBlockHashes: makeMap(),
    }
  )
)

export const handleDuplicateMessages = curry(
  (currentDoc, messages, dupeBlockMsgIndexes) =>
    forEach(index =>
      pipe(
        nth($, messages),
        message =>
          pipe(
            propOr([], 'docs'),
            unless(
              includes(currentDoc),
              insert(dupeBlockMsgIndexes.length + 1, currentDoc)
            ),
            objOf('docs'),
            mergeRight(message)
          )(message),
        insert(index, $, messages)
      )
    )(dupeBlockMsgIndexes)
)

const lookupHashIndex = curry((hashes, hash) =>
  pipe(mapGet(hash), propOr(-1, 'msgInd'))(hashes)
)

const isValidIndex = x => x > -1

const insertMatch = curry((messages, docs, filePath, docHash, fullDocHashes) =>
  pipe(
    lookupHashIndex(fullDocHashes),
    ifElse(
      isValidIndex,
      i =>
        pipe(
          nth($),
          propOr([], 'docs'),
          unless(includes(filePath), concat([filePath])),
          set(lensIndex(i), $, messages)
        )(messages),
      pipe(
        mapGet(docHash),
        tap(set(lensProp('msgInd'), messages.length)),
        propOr(-1, 'docInd'),
        nth($, docs),
        propOr('', 'filePath'),
        x =>
          concat(messages, [
            makeMessage([filePath, x], IDENTICAL_FILE, docHash),
          ])
      )
    )
  )(docHash)
)

const doMoreComplicatedStuff = () => {
  const blocks = makeBlockArray(doc.content)
  const minifiedBlocks = minifyBlocks(blocks)
  // We iterate over the current document's minified blocks
  minifiedBlocks.map(block => {
    if (!meetsSizeCriteria(block, config.minLines - 1, config.minChars)) {
      console.log('continue')
      return
    }
    // First we must check if this block is even worth checking, as we have config params which set some criteria for the content size
    const blockHash = hashString(minifiedBlocks[b])
    const blockMatched = allBlockHashes.has(blockHash)
    const currentDocInd = fullDocHashes.get(docHash).docInd
    if (!blockMatched) {
      allBlockHashes.set(blockHash, { docIndexes: [currentDocInd] })
    } else {
      const block = blocks[b]
      state.dupedLines += numLines(block)
      state.numBlockDupes++

      const docIndexes = allBlockHashes.get(blockHash).docIndexes
      const currentDoc = doc.filePath
      const matchedDocs = docIndexes.map(di => docs[di])
      const matchedDocFilePaths = matchedDocs.map(di => di.filePath)
      const isIntraFileDupe = matchedDocs.includes(doc)

      if (!isIntraFileDupe) {
        docIndexes.push(fullDocHashes.get(docHash).docInd)
      } else {
        // TODO: Add count for number of times repeated in the same file
        const di = intraFileDupeInd(currentDoc, messages)
        if (di === -1) {
          messages.push(
            makeMessage([currentDoc], INTRA_FILE_DUPLICATE, blockHash, block)
          )
        } else {
          messages[di].content.push(block)
        }
        console.log('continue')
        return
      }

      const dupeBlockMsgIndexes = interFileDupeMsgIndexesByHash(
        blockHash,
        messages
      )
      const dupeFileMsgInd = messageIndexByFiles(matchedDocFilePaths, messages)

      const firstTimeBlockHasMatched = dupeBlockMsgIndexes.length === 0
      const firstTimeFilesHaveMatchingBlock = dupeFileMsgInd === -1

      if (firstTimeBlockHasMatched) {
        messages.push(
          makeMessage(
            matchedDocFilePaths.concat(currentDoc),
            INTER_FILE_DUPLICATE,
            blockHash,
            block
          )
        )
      } else {
        dupeBlockMsgIndexes.forEach(i => {
          if (!messages[i].docs.includes(currentDoc)) {
            messages[i].docs.push(currentDoc)
          }
        })
      }
    }
  })(docs.length)

  return combineMessages(messages)
}

const compare = curry((config, docs) => {
  const messages = []
  const fullDocHashes = makeMap()
  const allBlockHashes = makeMap()
  const state = {
    dupedLines: 0,
    numFileDupes: 0,
  }
  return pipe(
    addIndex(map)((doc, i) => {
      const { content, filePath } = doc
      const docHash = cleanHash(content)
      const fullDocMatched = mapHas(docHash, fullDocHashes)
      return pipe(
        ifElse(
          mapHas(docHash),
          mapSet(docHash, { docInd: i }),
          insertMatch(messages, docs, filePath, docHash)
        ),
        when(
          isTextFile,
          // do more complicated stuff
          doMoreComplicatedStuff
        )
      )(fullDocHashes)
    })
  )(docs)
})
