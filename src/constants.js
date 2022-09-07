export const INITIAL_STATE = {
  total: {
    lines: 0,
    files: 0,
  },
  duplicate: {
    lines: 0,
    files: 0,
    blocks: 0,
    inFile: 0,
  },
}

// .raincoatrc
//
// - exclude:
//   - node_modules/**
//   - build/**
// - size: 100
// - files: "**/*.*"
// - lines: 4
// - threshold: 95

export const HELP_STRINGS = {
  init: 'Initialize raincoat in this codebase',
  color: 'Toggle color',
  help: 'This help text',
  files: 'An array of globs to search',
  exclude: 'An array of globs to ignore',
  size: 'The number of characters to inspect',
  lines: 'The number of lines to inspect',
  threshold: 'Coverage threshold as a %',
  parallelFiles: 'Number of files to read at a time (default: 10)',
  debug: 'Enable debug logging. Equivalent to `DEBUG="raincoat:*" raincoat`',
}

export const yargsConfig = {
  alias: {
    color: ['c'],
    debug: ['d'],
    exclude: ['x'],
    files: ['i'],
    help: ['h'],
    init: ['n'],
    lines: ['l'],
    parallelFiles: ['p'],
    size: ['s'],
    threshold: ['t'],
  },
  default: { color: true },
  array: ['x'],
  number: ['s', 'l', 't', 'p'],
  boolean: ['h', 'c', 'n', 'd'],
}

export const ASCII_TEXT = `               _                        __
   _________ _(_)___  _________  ____ _/ /_
  / ___/ __ \`/ / __ \\/ ___/ __ \\/ __ \`/ __/
 / /  / /_/ / / / / / /__/ /_/ / /_/ / /_
/_/   \\__,_/_/_/ /_/\\___/\\____/\\__,_/\\__/`

export const HELP_TEXT = `
# Keep things DRY, remember your raincoat!

Use raincoat to find repeated content.

Try using \`raincoat --init\`!

Options:`

export const INTER_FILE_DUPLICATE = `__IFD__`
export const IDENTICAL_FILE = `__IF__`
