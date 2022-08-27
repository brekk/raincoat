import crypto from 'node:crypto'

import { pipe, split, reject, isEmpty, map, replace } from 'ramda'

export const hashString = s => crypto.createHash('md5').update(s).digest('hex')
export const cleanString = replace(/(\n|\s|\t)/g, '')
export const makeBlockArray = pipe(split('\n\n'), reject(isEmpty))
export const cleanBlocks = pipe(reject(isEmpty), map(cleanString))

export const generateComparisons = () => {}

/*
export const generateComparisons = pipe(function compare(docs, config, state) {
  const messages = []
  const fullDocHashes = new Map()
  const allBlockHashes = new Map()

  reduce((state, [doc, content]) => pipe(
    cleanString,
    hashString,
     
  )(content), {messages, fullDocHashes, allBlockHashes})
      // We check if the hash of ALL of the minified content in current document already exists in our array of hashes
      // If it does, that means we have a duplicate of an entire document, so we check to see if there is a message with
      // that hash as a reference, and if there is then we add the docpath to the message... otherwise just add message
    let fullDocMatched = fullDocHashes.has(docHash)
    if (!fullDocMatched) {
      fullDocHashes.set(docHash, { docInd: i })
    } else {
      let existingMsgInd = fullDocHashes.get(docHash).msgInd
      let previouslyMatched = existingMsgInd > -1
      if (previouslyMatched) {
        let msg = messages[existingMsgInd]
        !msg.docs.includes(docs[i].filePath) && msg.docs.push(docs[i].filePath)
      } else {
        // msgInd is a way to point to a "message" related to a hash, which is faster than iterating over all messages looking for a hash
        fullDocHashes.get(docHash).msgInd = messages.length
        messages.push(
          new Message(
            [
              docs[i].filePath,
              docs[fullDocHashes.get(docHash).docInd].filePath,
            ],
            constants.IDENTICAL_FILE,
            docHash
          )
        )
      }
      state.dupedLines += numLines(docs[i].content)
      state.numFileDupes++
      continue
    }
    // If the file being examined is not a text file, we want to evaluate only it's full signature
    if (!isTextFile(docs[i].filePath)) {
      continue
    }
      // If we don't continue here when fullDocMatched, then we will start matching the blocks of files which are pure duplicates
      // However, if we do continue, then if a different file shares a fragment with the current file, we will not realize.
      // The solution might be to not continue here, but skip blocks who have hashes that map files which are perfect duplicates,
      // so check below at match time... a duplicate message will have already been created. Related to: https://github.com/rdgd/twly/issues/4

    let blocks = makeBlockArray(docs[i].content)
    let minifiedBlocks = minifyBlocks(blocks)
    // We iterate over the current document's minified blocks
    for (let b = 0; b < minifiedBlocks.length; b++) {
      if (!meetsSizeCriteria(blocks[b], config.minLines - 1, config.minChars)) {
        continue
      }
      // First we must check if this block is even worth checking, as we have config params which set some criteria for the content size
      let blockHash = hashString(minifiedBlocks[b])
      let blockMatched = allBlockHashes.has(blockHash)
      let currentDocInd = fullDocHashes.get(docHash).docInd
      if (!blockMatched) {
        allBlockHashes.set(blockHash, { docIndexes: [currentDocInd] })
      } else {
        let block = blocks[b]
        state.dupedLines += numLines(block)
        state.numBlockDupes++

        let docIndexes = allBlockHashes.get(blockHash).docIndexes
        let currentDoc = docs[i].filePath
        let matchedDocs = docIndexes.map(di => docs[di])
        let matchedDocFilePaths = matchedDocs.map(di => di.filePath)
        let isIntraFileDupe = matchedDocs.includes(docs[i])

        if (!isIntraFileDupe) {
          docIndexes.push(fullDocHashes.get(docHash).docInd)
        } else {
          // TODO: Add count for number of times repeated in the same file
          let di = intraFileDupeInd(currentDoc, messages)
          if (di === -1) {
            messages.push(
              new Message(
                [currentDoc],
                constants.INTRA_FILE_DUPLICATE,
                blockHash,
                block
              )
            )
          } else {
            messages[di].content.push(block)
          }
          continue
        }

        let dupeBlockMsgIndexes = interFileDupeMsgIndexesByHash(
          blockHash,
          messages
        )
        let dupeFileMsgInd = messageIndexByFiles(matchedDocFilePaths, messages)

        let firstTimeBlockHasMatched = dupeBlockMsgIndexes.length === 0
        let firstTimeFilesHaveMatchingBlock = dupeFileMsgInd === -1

        if (firstTimeBlockHasMatched) {
          messages.push(
            new Message(
              matchedDocFilePaths.concat(currentDoc),
              constants.INTER_FILE_DUPLICATE,
              blockHash,
              block
            )
          )
        } else {
          dupeBlockMsgIndexes.forEach(i => {
            let alreadyReportedByCurrentFile =
              messages[i].docs.includes(currentDoc)
            if (!alreadyReportedByCurrentFile) {
              messages[i].docs.push(currentDoc)
            }
          })
        }
      }
    }
  }

  return combineMessages(messages)
})*/
