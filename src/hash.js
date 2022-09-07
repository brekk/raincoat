import crypto from 'node:crypto'

import { get, of as makeMap, has as mapHas } from 'cartographic'
import { IDENTICAL_FILE, INTER_FILE_DUPLICATE } from './constants'
import {
  range,
  forEach,
  mergeRight,
  curry,
  insert,
  objOf,
  __ as $,
  addIndex,
  adjust,
  concat,
  curryN,
  identity as I,
  ifElse,
  includes,
  isEmpty,
  lt,
  map,
  nth,
  of,
  pipe,
  propOr,
  reduce,
  reject,
  replace,
  set,
  split,
  unless,
} from 'ramda'
import { info as __info, debug as __debug } from './trace'

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
const compare = curry((config, docs) => {
  const messages = []
  const fullDocHashes = makeMap()
  const allBlockHashes = makeMap()
  const state = {
    dupedLines: 0,
    numFileDupes: 0,
  }
  pipe(
    range(0),
    map(i => {
      const doc = docs[i]
      const docHash = cleanHash(doc.content)
      const fullDocMatched = mapHas(docHash, fullDocHashes)
      if (!fullDocMatched) {
        fullDocHashes.set(docHash, { docInd: i })
      } else {
        const existingMsgInd = fullDocHashes.get(docHash).msgInd
        const previouslyMatched = existingMsgInd > -1
        if (previouslyMatched) {
          const msg = messages[existingMsgInd]
          if (!msg.docs.includes(doc.filePath)) {
            msg.docs.push(doc.filePath)
          }
        } else {
          fullDocHashes.get(docHash).msgInd = messages.length
          messages.push(
            new Message(
              [doc.filePath, docs[fullDocHashes.get(docHash).docInd].filePath],
              IDENTICAL_FILE,
              docHash
            )
          )
        }
        state.dupedLines += numLines(doc.content)
        state.numFileDupes++
        console.log('continue')
        return
      }
      // If the file being examined is not a text file, we want to evaluate only it's full signature
      if (!isTextFile(doc.filePath)) {
        console.log('continue')
        return
      }
      /*
      If we don't continue here when fullDocMatched, then we will start matching the blocks of files which are pure duplicates
      However, if we do continue, then if a different file shares a fragment with the current file, we will not realize.
      The solution might be to not continue here, but skip blocks who have hashes that map files which are perfect duplicates,
      so check below at match time... a duplicate message will have already been created. Related to: https://github.com/rdgd/twly/issues/4
    */

      const blocks = makeBlockArray(doc.content)
      const minifiedBlocks = minifyBlocks(blocks)
      // We iterate over the current document's minified blocks
      for (let b = 0; b < minifiedBlocks.length; b++) {
        if (
          !meetsSizeCriteria(blocks[b], config.minLines - 1, config.minChars)
        ) {
          continue
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
                new Message(
                  [currentDoc],
                  INTRA_FILE_DUPLICATE,
                  blockHash,
                  block
                )
              )
            } else {
              messages[di].content.push(block)
            }
            continue
          }

          const dupeBlockMsgIndexes = interFileDupeMsgIndexesByHash(
            blockHash,
            messages
          )
          const dupeFileMsgInd = messageIndexByFiles(
            matchedDocFilePaths,
            messages
          )

          const firstTimeBlockHasMatched = dupeBlockMsgIndexes.length === 0
          const firstTimeFilesHaveMatchingBlock = dupeFileMsgInd === -1

          if (firstTimeBlockHasMatched) {
            messages.push(
              new Message(
                matchedDocFilePaths.concat(currentDoc),
                INTER_FILE_DUPLICATE,
                blockHash,
                block
              )
            )
          } else {
            dupeBlockMsgIndexes.forEach(i => {
              const alreadyReportedByCurrentFile =
                messages[i].docs.includes(currentDoc)
              if (!alreadyReportedByCurrentFile) {
                messages[i].docs.push(currentDoc)
              }
            })
          }
        }
      }
    })
  )(docs.length)

  return combineMessages(messages)
})
